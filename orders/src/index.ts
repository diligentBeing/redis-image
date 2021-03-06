import mongoose, { mongo } from "mongoose";
import { natsWrapper } from "./natsWrapper";
import { app } from "./app";
import { TicketCreatedListener } from "./events/listeners/ticketCreatedListener";
import { TicketUpdatedListener } from "./events/listeners/ticketUpdatedListener";
import { ExpirationCompletedListener } from "./events/listeners/expirationCompletedListener";
import { PaymentCreatedListener } from "./events/listeners/paymentCreatedListener";
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT value not found");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }

  try {
    //Connect to nats-streaming
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log(`NATS connection closed!`);
      process.exit();
    });

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    //listen
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompletedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    //Connect to bd
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to db");
  } catch (err) {
    console.error(err.message);
  }
};

start();

app.listen(3000, () => {
  console.log(`auth listening on port 3000 ⚡⚡⚡ ಠಿ_ಠ`);
});
