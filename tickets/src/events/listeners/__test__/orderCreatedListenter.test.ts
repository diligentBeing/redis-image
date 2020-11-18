import { OrderCreatedEvent, OrderStatus } from "@tixy/common";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedListener } from "../orderCreatedListener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //Create and save a ticket
  const ticket = new Ticket({
    title: "concert",
    price: 10,
    userId: "adsdf",
  });

  await ticket.save();

  // Create a fake data event
  const data: OrderCreatedEvent["data"] = {
    version: 0,
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: "asdf",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // Create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it("sets the userId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks thhe message", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
