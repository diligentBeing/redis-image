import {
  ExpirationCompletedEvent,
  Listener,
  OrderStatus,
  Subjects,
} from "@tixy/common";
import { version } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { natsWrapper } from "../../natsWrapper";
import { OrderCancelledPublisher } from "../publishers/orderCancelledPublisher";
import { queueGroupName } from "./queueGroupName";

export class ExpirationCompletedListener extends Listener<
  ExpirationCompletedEvent
> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;

  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompletedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });

    msg.ack();
  }
}
