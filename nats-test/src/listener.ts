import nats, { Message, Stan } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { listenerCount } from "process";
import { TicketCreatedListener } from "./../src/events/ticketCreatedListener";
import { TicketUpdatedListener } from "./events/ticketUpdatedListener";

console.clear();
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    console.log(`NATS connection closed!`);
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
  new TicketUpdatedListener(stan).listen();
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
