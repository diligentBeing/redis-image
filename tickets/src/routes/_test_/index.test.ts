import request from "supertest";
import { signin } from "./../../test/helperSignin";
import { app } from "../../app";

const createTicket = (title: string, price: number) => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({ title: title, price: price })
    .expect(200);
};
it("can fetch a list of tickets", async () => {
  await createTicket("taxy", 30);
  await createTicket("Daxy", 30);
  await createTicket("paxy", 30);
  await createTicket("zaxy", 30);

  const response = await request(app).get(`/api/tickets`).send().expect(200);
  expect(response.body.length).toEqual(4);
});
