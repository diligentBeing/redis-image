import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signup(): string[];
    }
  }
}

jest.mock("../natsWrapper");

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY =
    "hippopotamus-dragons-platypus-swallow-seastar-lavender";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signup = () => {
  //Build a JWT payload {id, email}
  const payload = {
    id: "asdfasf22",
    email: "test@test.com",
  };

  //Create a JWT;
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build session Object. {jwt: MY_JWT}
  const session = { jwt: token };

  //Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  //Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  //return a string that's the cookie with the encoded data
  return [`express:sess=${base64}`];
};
