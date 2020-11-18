import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../natsWrapper";
import { signin } from "../../test/helperSignin";
import { Order, OrderStatus } from "./../../models/Order";
import { Ticket } from "./../../models/Ticket";

it("marks an order as cancelled", async () => {
  //create a ticket with Ticket Model
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const userOne = signin();

  //make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make a request to cancel the order
  const { body: returnedOrder } = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", userOne)
    .send({})
    .expect(204);
  //expectation to make sure the thing is cancelled
  console.log(returnedOrder);
  const upOrder = await Order.findById(order.id);
  expect(upOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  //create a ticket with Ticket Model
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const userOne = signin();

  //make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make a request to cancel the order
  const { body: returnedOrder } = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", userOne)
    .send({})
    .expect(204);

  //expect(natsWrapper.client.publish).toHaveBeenCalled();
});
