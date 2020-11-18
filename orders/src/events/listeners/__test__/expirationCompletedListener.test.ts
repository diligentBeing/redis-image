import { ExpirationCompletedEvent, OrderStatus } from "@tixy/common";
import mongoose from "mongoose";
import { Order } from "../../../models/Order";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../natsWrapper";
import { ExpirationCompletedListener } from "../expirationCompletedListener";

const setup = async () => {
  // Create an instance of the listener
  const listener = new ExpirationCompletedListener(natsWrapper.client);

  const ticket = new Ticket({
    _id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // Create a fake data event
  const order = new Order({
    status: OrderStatus.Created,
    expiresAt: new Date(),
    userId: mongoose.Types.ObjectId().toHexString(),
    ticket,
  });

  await order.save();

  // Create a fake data event
  const data: ExpirationCompletedEvent["data"] = {
    orderId: order.id,
  };

  // Create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, order, ticket, data, msg };
};

it("updatess the order status to cancelled", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelled event", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // write assertions to make sure a ticket was created
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("acks message", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  //Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
