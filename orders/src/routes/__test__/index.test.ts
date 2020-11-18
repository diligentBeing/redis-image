import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/helperSignin";
import { Order, OrderStatus } from "./../../models/Order";
import { Ticket } from "./../../models/Ticket";

const buildTicket = async () => {
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  return ticket;
};

it("Fetches orders for a particular user", async () => {
  //Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  //Create one order as User #1
  const userOne = signin();
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  //Create two orders as User #2
  const userTwo = signin();
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  //Make request to get orders as User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .send({})
    .expect(200);

  //Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
