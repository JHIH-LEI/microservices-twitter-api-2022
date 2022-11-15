import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { showTweetRouter } from "./routes/show";
import { errorHandler, NotFoundError } from "@domosideproject/twitter-common";
import { updateTweetRouter } from "./routes/update";
import { deleteTweetRouter } from "./routes/delete";
import { newTweetRouter } from "./routes/new";
import { indexTweetRouter } from "./routes/index";
import amqp from "amqplib";
import { LikeCreatedConsumer } from "./subscribers/like-created";
import { LikeDeletedConsumer } from "./subscribers/like-deleted";
import { ReplyCreatedConsumer } from "./subscribers/reply-created";
import { ReplyDeletedConsumer } from "./subscribers/reply-deleted";
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

app.use("/api/tweets", showTweetRouter);
app.use("/api/tweets", updateTweetRouter);
app.use("/api/tweets", deleteTweetRouter);
app.use("/api/tweets", newTweetRouter);
app.use("/api/tweets", indexTweetRouter);

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
  await new LikeCreatedConsumer(connection).consumeFromQueue();
  await new LikeDeletedConsumer(connection).consumeFromQueue();
  await new ReplyCreatedConsumer(connection).consumeFromQueue();
  await new ReplyDeletedConsumer(connection).consumeFromQueue();
  await new UserCreatedConsumer(connection).consumeFromQueue();
  await new UserUpdatedConsumer(connection).consumeFromQueue();
};

setupRabbitMQ();

export { app, connection, senderChannel, listenerChannel };