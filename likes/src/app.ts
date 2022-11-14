import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { getUserLikedTweetsRouter } from "./routes/getUserLikedTweets";
import { newLikeRouter } from "./routes/new";
import { errorHandler, NotFoundError } from "@domosideproject/twitter-common";
import { deleteLikeRouter } from "./routes/delete";
import amqp from "amqplib";
import { TweetCreatedConsumer } from "./subscribers/tweet-created";
import { TweetDeletedConsumer } from "./subscribers/tweet-deleted";
import { TweetUpdatedConsumer } from "./subscribers/tweet-updated";
import { UserCreatedConsumer } from "./subscribers/user-created";
import { UserUpdatedConsumer } from "./subscribers/user-updated";
import { ReplyCreatedConsumer } from "./subscribers/reply-created";
import { ReplyDeletedConsumer } from "./subscribers/reply-deleted";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // cookie內容不需加密，因為jwt已經加密了
    secure: process.env.NODE_ENV !== "test", // https才會set-cookie(如果有在req.session物件放東西)
  })
);

app.use("/api/likes", getUserLikedTweetsRouter);
app.use("/api/likes", newLikeRouter);
app.use("/api/likes", deleteLikeRouter);

app.all("*", () => {
  throw new NotFoundError("can not find route");
});

app.use(errorHandler);

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

  await new TweetCreatedConsumer(connection).consumeFromQueue();
  await new TweetUpdatedConsumer(connection).consumeFromQueue();
  await new TweetDeletedConsumer(connection).consumeFromQueue();
  await new UserCreatedConsumer(connection).consumeFromQueue();
  await new UserUpdatedConsumer(connection).consumeFromQueue();
  await new ReplyCreatedConsumer(connection).consumeFromQueue();
  await new ReplyDeletedConsumer(connection).consumeFromQueue();
};

setupRabbitMQ();

export { app, senderChannel, listenerChannel, connection };
