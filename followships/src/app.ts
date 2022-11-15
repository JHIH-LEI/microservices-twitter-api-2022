import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { unFollowRouter } from "./routes/delete";
import { followRouter } from "./routes/new";
import { topUserRouter } from "./routes/topUser";
import { userFollowings } from "./routes/userFollowings";
import { userFollowers } from "./routes/userFollowers";
import { errorHandler, NotFoundError } from "@domosideproject/twitter-common";
import amqp from "amqplib";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // cookie內容不需加密，因為jwt已經加密了
    secure: process.env.NODE_ENV !== "test", // https才會set-cookie(如果有在req.session物件放東西)
  })
);

app.use("/api/followships", topUserRouter);
app.use("/api/followships", userFollowers);
app.use("/api/followships", userFollowings);
app.use("/api/followships", followRouter);
app.use("/api/followships", unFollowRouter);

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
};

setupRabbitMQ();

export { app, listenerChannel, senderChannel, connection };
