import { NotificationType } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { NotificationAttrs } from "../../../models/notification";
import { emitNotificationCounts } from "../notificationCounts";
import { Notification } from "../../../models/notification";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../../types";
import { Server } from "socket.io";

it("emit total unread notification number to connected user", async () => {
  const connectedUserId = new Types.ObjectId();

  await setup(connectedUserId);

  // 測試function
  const mockIoEmit = jest
    .fn()
    .mockImplementation((event: string, content: any) => {
      console.log(`io.to()emit(${event}, ${content})`);
    });
  // @ts-ignore
  const mockIo = {
    to: jest.fn().mockImplementation((room: string) => ({ emit: mockIoEmit })),
  } as Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  await emitNotificationCounts({
    userId: connectedUserId.toHexString(),
    socketId: new Types.ObjectId().toHexString(),
    io: mockIo,
  });

  expect(mockIoEmit).toBeCalledTimes(1);
  expect(mockIoEmit.mock.calls[0][0]).toBe("notificationCounts");
  expect(mockIoEmit.mock.calls[0][1]).toBe(3);
});

/**
 *setup Notification History by create 3 UnRead & 1 Read for connected user and 1 unread for other user
 */
const setup = async (connectedUserId: Types.ObjectId) => {
  // create notification history in db
  // 3 unread 1 read for
  const readedNotificationContentForConnectedUser: NotificationAttrs = {
    id: new Types.ObjectId(),
    main: "twitter",
    type: NotificationType.Tweet,
    createdAt: new Date(),
    isRead: true,
    triggerId: new Types.ObjectId(),
    receiverId: connectedUserId,
  };

  const unReadNotificationContentForConnectedUser: NotificationAttrs = {
    id: new Types.ObjectId(),
    main: "twitter",
    type: NotificationType.Tweet,
    createdAt: new Date(),
    isRead: false,
    triggerId: new Types.ObjectId(),
    receiverId: connectedUserId,
  };

  // other user unread notification
  const unReadNotificationContentForOtherUser: NotificationAttrs = {
    id: new Types.ObjectId(),
    main: "twitter",
    type: NotificationType.Tweet,
    createdAt: new Date(),
    isRead: false,
    triggerId: new Types.ObjectId(),
    receiverId: new Types.ObjectId(),
  };

  await Promise.all([
    // 3 unread for connected user
    Notification.create(unReadNotificationContentForConnectedUser),
    Notification.create(unReadNotificationContentForConnectedUser),
    Notification.create(unReadNotificationContentForConnectedUser),
    // one read for connected user
    Notification.create(readedNotificationContentForConnectedUser),
    // one unread is other user's
    Notification.create(unReadNotificationContentForOtherUser),
  ]);
};
