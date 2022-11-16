import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import express from "express";
import http from "http";
import amqp from "amqplib";
const app = express();
const server = http.createServer(app);
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";

if (!process.env.JWT_KEY) {
  throw new Error("missing JWT_KEY env variable");
}

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

let connection: amqp.Connection;
let listenerChannel: amqp.Channel;

const setupRabbitMQ = async () => {
  if (!process.env.RABBITMQ_URL) {
    throw new Error("RABBITMQ_URL env is required");
  }

  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  listenerChannel = await connection.createChannel();
};

setupRabbitMQ();

// Redis

// get cookie
// jwt auth
// 將userId存在socketData

io.on("connection", (socket) => {
  // rabbitMQ consume notification:created
  // callBack會emit notify,看來必須傳入socket

  // 處理isRead事件 => 根據給的id去找到 Notification doc把 isRead: true, emit給該user的socket：這個通知已讀了。

  socket.on("disconnect", () => {
    // 去socketData拿到userId
    // 將socketId從redis userId: {socketIds}移除
  });
});

export { server, listenerChannel, connection };
