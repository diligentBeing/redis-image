import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@tixy/common";
import mongoose from "mongoose";
import { isJSDocEnumTag } from "typescript";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedListener } from "../orderCreatedListener";
import { Order } from "../../../models/Order";
import { OrderCancelledListener } from "../orderCancelledListener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = new Order({
    _id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: "dfdsaf",
    status: OrderStatus.Created,
    price: 10,
  });

  await order.save();
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "gfsgfg",
      price: 10,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it("updates status of the order", async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
