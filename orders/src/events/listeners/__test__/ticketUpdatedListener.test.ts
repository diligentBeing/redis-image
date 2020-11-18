import { TicketCreatedEvent, TicketUpdateddEvent } from "@tixy/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../natsWrapper";
import { queueGroupName } from "../queueGroupName";
import { TicketUpdatedListener } from "../ticketUpdatedListener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //Create and save a ticket
  const ticket = new Ticket({
    _id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
  });
  await ticket.save();

  // Create a fake data event
  const data: TicketUpdateddEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "new concert",
    price: 110,
    userId: mongoose.Types.ObjectId().toHexString(),
  };
  // Create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { msg, data, ticket, listener };
};

it("finds, updates, and saves a ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks thhe message", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if event has a skipped version", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the onMessage function with the data object + message object
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
