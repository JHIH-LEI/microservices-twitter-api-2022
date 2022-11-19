import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../types";
import { Notification } from "../../models/notification";

export async function emitNotificationCounts({
  userId,
  socketId,
  io,
}: {
  userId: string;
  socketId: string;
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
}) {
  const totalUnReadNotification = await Notification.countDocuments({
    $and: [{ receiverId: userId, isRead: false }],
  });

  io.to(socketId).emit("notificationCounts", totalUnReadNotification);
}
