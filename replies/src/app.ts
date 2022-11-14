import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { getTweetRepliesRouter } from "./routes/getTweetReplies";
import { getUserRepliesRouter } from "./routes/getUserReplies";
import { newReplyRouter } from "./routes/new";
import { deleteReplyRouter } from "./routes/delete";
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

app.use("/api/replies", getTweetRepliesRouter);
app.use("/api/replies", getUserRepliesRouter);
app.use("/api/replies", newReplyRouter);
app.use("/api/replies", deleteReplyRouter);

let connection: amqp.Connection;
let senderChannel: amqp.Channel;
let listenerChannel: amqp.Channel;

const setupRabbitMQ = async () => {
  if (!process.env.RABBITMQ_URL) {
    throw new Error("RABBITMQ_URL env is required");
  }

  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  listenerChannel = await connection.createChannel();
  senderChannel = await connection.createChannel();

  // @ts-ignore
  await new UserCreatedConsumer(connection).consumeFromQueue();
  // @ts-ignore
  await new UserUpdatedConsumer(connection).consumeFromQueue();
};

setupRabbitMQ();

app.all("*", () => {
  throw new NotFoundError("can not find route");
});

app.use(errorHandler);

export { app, senderChannel, listenerChannel, connection };
