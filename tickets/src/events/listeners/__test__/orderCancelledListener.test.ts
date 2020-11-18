import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@tixy/common";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../natsWrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelledListener } from "../orderCancelledListener";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  //Create and save a ticket
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = new Ticket({
    title: "concert",
    price: 10,
    userId: "adsdf",
  });

  ticket.set({ orderId });

  await ticket.save();

  // Create a fake data event
  const data: OrderCancelledEvent["data"] = {
    version: 0,
    id: mongoose.Types.ObjectId().toHexString(),
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
  return { listener, ticket, orderId, data, msg };
};

it("sets the userId of the ticket to undefined. That is Cancelled", async () => {
  const { listener, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
});

it("acks thhe message", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket cancelled event", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).not.toBeDefined();
});
