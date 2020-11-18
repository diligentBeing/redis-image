import { OrderCreatedListener } from "./events/listeners/orderCreatedListener";
import { natsWrapper } from "./natsWrapper";
const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.REDIS_HOST) {
    throw new Error("REDIS_HOST must be defined");
  }

  try {
    //Connect to nats-streaming
    await natsWrapper
      .connect(
        process.env.NATS_CLUSTER_ID,
        process.env.NATS_CLIENT_ID,
        process.env.NATS_URL
      )
      .catch((err) => console.log("Error caught"));

    natsWrapper.client.on("close", () => {
      console.log(`NATS connection closed!`);
      process.exit();
    });

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err.message);
  }
};

start();
