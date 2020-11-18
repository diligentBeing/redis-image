import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../natsWrapper";
import { signin } from "../../test/helperSignin";
import { Order, OrderStatus } from "./../../models/Order";
import { Ticket } from "./../../models/Ticket";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket already exists", async () => {
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const order = new Order({
    ticket,
    userId: "adsfesdafda",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("Emits an order created event", async () => {
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
