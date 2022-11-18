import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import express from "express";
import http from "http";
import amqp from "amqplib";
const app = express();
const server = http.createServer(app);
import { Server } from "socket.io";
import Redis from "ioredis";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";
import jwt from "jsonwebtoken";
import { RedisOperator } from "./services/redis-operator";
import { DBError } from "@domosideproject/twitter-common";
import { setupMongoose } from "./mongodbConfig";

if (!process.env.JWT_KEY) {
  throw new Error("missing JWT_KEY env variable");
}

if (!process.env.REDIS_URL) {
  throw new Error("missing REDIS_URL env variable");
}

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, { pingTimeout: 270000, pingInterval: 270000 });

const redis = new Redis(process.env.REDIS_URL);

let connection: amqp.Connection;
let listenerChannel: amqp.Channel;

setupMongoose();
const setupRabbitMQ = async () => {
  if (!process.env.RABBITMQ_URL) {
    throw new Error("RABBITMQ_URL env is required");
  }

  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  listenerChannel = await connection.createChannel();
};

setupRabbitMQ();

// auth
io.use(async function (socket, next) {
  if (socket.handshake.auth.token) {
    try {
      const payload = jwt.verify(
        socket.handshake.auth.token,
        process.env.JWT_KEY!
      ) as { id: string };

      socket.data.userId = payload.id;
      socket.data.socketId = socket.id;
    } catch (err) {
      next(new Error("jwt invalid"));
    }

    await RedisOperator.addNotifyUserSocketIds({
      userId: socket.data.userId!,
      socketId: socket.id,
    }).catch((err) => next(new DBError(err)));

    next();
  }
  next(new Error("Need login"));
}).on("connection", (socket) => {
  // rabbitMQ consume notification:created
  // 處理isRead事件 => 根據給的id去找到 Notification doc把 isRead: true, emit給該user的socket：這個通知已讀了。

  socket.on("disconnect", async () => {
    // jest test在執行過程中會斷線，原因是transport close，但測試還沒跑完，不可清除socket資料
    // TODO: 測試disconnect的時候有沒有把socketId從redis移除
    if (process.env.NODE_ENV !== "test") {
      await RedisOperator.removeNotifyUserSocketIds({
        userId: socket.data.userId!,
        socketId: socket.data.socketId!,
      });
    }
  });
});

server.listen(3000, () => {
  console.log("notify socket server listening on 3000");
});

export { listenerChannel, connection, redis };
