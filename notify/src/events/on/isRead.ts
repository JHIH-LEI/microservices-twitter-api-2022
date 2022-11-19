import { Notification } from "../../models/notification";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../types";

export async function onIsReadCallBack({
  notificationId,
  socketId,
  io,
}: {
  notificationId: string;
  socketId: string;
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
}) {
  await Notification.updateOne({ _id: notificationId }, { isRead: true }).catch(
    (err) => {
      console.error(err);
      return;
    }
  );

  io.to(socketId).emit("isRead", notificationId);
}
