import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@domosideproject/twitter-common";
import amqp from "amqplib";
import { UserCreatedConsumer } from "./subscribers/user-created";
import { UserUpdatedConsumer } from "./subscribers/user-updated";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // cookie內容不需加密，因為jwt已經加密了
    secure: process.env.NODE_ENV !== "test", // https才會set-cookie(如果有在req.session物件放東西)
  })
);

import setupRoutes from "./routes/index";
setupRoutes(app);
// app.use("/api/tweets",tweetRouter)

app.all("*", () => {
  throw new NotFoundError("can not find route");
});

app.use(errorHandler);

let connection: amqp.Connection;
let senderChannel: amqp.Channel;
let listenerChannel: amqp.Channel;

const setupRabbitMQ = async () => {
  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  listenerChannel = await connection.createChannel();
  senderChannel = await connection.createChannel();
  new UserCreatedConsumer(connection).consumeFromQueue();
  new UserUpdatedConsumer(connection).consumeFromQueue();
};

setupRabbitMQ();

export { app, connection, senderChannel, listenerChannel };
