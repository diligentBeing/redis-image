import { OrderStatus } from "@tixy/common";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { Order } from "../../models/Order";

import { app } from "../../app";
import { signin } from "../../test/helperSignin";
import { stripe } from "../../stripe";
import { Payment } from "../../models/Payment";

jest.mock("../../stripe");

it("Returns a 404 when puchasing a n order that deos not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      token: "adsfdasfas",
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("Returns a 401 when purchasing an order that does not belong to user", async () => {
  const order = new Order({
    _id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      token: "adsfdasfas",
      orderId: order.id,
    })
    .expect(401);
});

it("Returns 400 when purchasing a cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = new Order({
    _id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "adsfdasfas",
      orderId: order.id,
    })
    .expect(400);
});

it("Returns 201 when purchasing a created order with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = new Order({
    _id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(20 * 100);
  expect(chargeOptions.currency).toEqual("usd");

  //const payment = await Payment.findOne({orderId: order.id, stripeId: stripeChar});
  //expect(payment).not.toBeNull();
});
