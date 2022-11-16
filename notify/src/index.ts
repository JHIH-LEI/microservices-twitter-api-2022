import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

// init MongoDB, Redis, RabbitMQ

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

server.listen(3000, () => {
  console.log("notify socket server listening on 3000");
});
