import { TicketCreatedEvent } from "@tixy/common";
import mongoose from "mongoose";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../natsWrapper";
import { queueGroupName } from "../queueGroupName";
import { TicketCreatedListener } from "../ticketCreatedListener";

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString(),
  };
  // Create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks message", async () => {
  const { listener, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
