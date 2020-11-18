import request from "supertest";
import { signin } from "./../../test/helperSignin";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "./../../natsWrapper";
import { Ticket } from "../../models/Ticket";

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: title, price: price })
    .expect(200);
};

it("returns a 404 if the ticket id is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "klaxy",
      price: 50,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "klaxy",
      price: 50,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await createTicket("taxy", 30);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", signin())
    .send({
      title: "klaxy",
      price: 45,
    })
    .expect(401);
});

it("returns a 400 if the ticket title or price is invalid", async () => {
  const cookie = signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "taxys", price: 65 })
    .expect(200);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 30,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdf",
      price: -30,
    })
    .expect(400);
});

it("updates the ticket", async () => {
  const cookie = signin();
  const title = "Plaxy";
  const price = 45;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "taxys", price: 65 })
    .expect(200);

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: title,
      price: price,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${updatedResponse.body.id}`)
    .set("Cookie", cookie)
    .send({})
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it("updates the ticket", async () => {
  const cookie = signin();
  const title = "Plaxy";
  const price = 45;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "taxys", price: 65 })
    .expect(200);

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: title,
      price: price,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("updates the ticket", async () => {
  const cookie = signin();
  const title = "Plaxy";
  const price = 45;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "taxys", price: 65 })
    .expect(200);

  const ticket = await Ticket.findById(response.body.id);
  ticket?.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  const updatedResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: title,
      price: price,
    })
    .expect(400);
});
