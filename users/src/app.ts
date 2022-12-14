import dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { newUserRouter } from "./routes/new";
import { signinUserRouter } from "./routes/signin";
import { updateUserRouter } from "./routes/update";
import { signoutUserRouter } from "./routes/signout";
import { currentUserRouter } from "./routes/current";
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

app.use("/api/users", newUserRouter);
app.use("/api/users", signinUserRouter);
app.use("/api/users", updateUserRouter);
app.use("/api/users", signoutUserRouter);
app.use("/api/users", currentUserRouter);

app.use("*", () => {
  throw new NotFoundError("can not find routes");
});
app.use(errorHandler);

if (!process.env.RABBITMQ_URL) {
  throw new Error("missing RABBITMQ_URL env variable");
}

let connection: amqp.Connection;
let channel: amqp.Channel;

const setupRabbitMQ = async () => {
  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await connection.createChannel();
};

setupRabbitMQ();

export { app, channel, connection };
