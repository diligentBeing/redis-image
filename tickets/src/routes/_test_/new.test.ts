import request from "supertest";
import { app } from "../../app";
import { signin } from "./../../test/helperSignin";
import { Ticket } from "./../../models/Ticket";
import { natsWrapper } from "./../../natsWrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  let response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "tixy",
      price: -10,
    })
    .expect(400);

  response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "tixy",
    })
    .expect(400);
});

it("it is valid", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "tixy", price: 20 })
    .expect(200);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it("publishes an event", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: "tixy", price: 20 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
