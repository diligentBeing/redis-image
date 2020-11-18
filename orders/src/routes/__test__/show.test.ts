import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/helperSignin";
import { Order, OrderStatus } from "./../../models/Order";
import { Ticket } from "./../../models/Ticket";

it("fetches the order", async () => {
  //Create a ticket and user
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const userOne = signin();

  //Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  //Make request to fetch the order

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userOne)
    .send({})
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("Returns an error if user is unauthorized", async () => {
  //Create a ticket and user

  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const userOne = signin();
  const userTwo = signin();

  //Make a request to build an order with this ticket

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  //Make request to fetch the order

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userTwo)
    .send({})
    .expect(401);
});
