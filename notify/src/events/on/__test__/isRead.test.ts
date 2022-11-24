import { onIsReadCallBack } from "../isRead";
import { Notification } from "../../../models/notification";
import { NotificationType } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../../types";
import { Server } from "socket.io";

it("change target notification isRead to true and then emit isRead to client", async () => {
  const beforeNotification = Notification.build({
    main: "reply",
    type: NotificationType.Reply,
    receiverId: new Types.ObjectId(),
    triggerId: new Types.ObjectId(),
    isRead: false,
    createdAt: new Date(),
    id: new Types.ObjectId(),
  });
  await beforeNotification.save();

  const mockIoEmit = jest
    .fn()
    .mockImplementation((event: string, content: any) => {
      console.log(`io.to()emit(${event}, ${content})`);
    });

  // @ts-ignore
  const mockIo = {
    to: jest.fn().mockImplementation((room: string) => {
      return {
        emit: mockIoEmit,
      };
    }),
  } as Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  await onIsReadCallBack({
    notificationId: beforeNotification._id,
    socketId: new Types.ObjectId().toHexString(),
    io: mockIo,
  });

  const afterNotification = await Notification.findById(beforeNotification._id);

  expect(afterNotification).not.toBeNull();
  expect(afterNotification!.isRead).toBe(true);
  expect(mockIoEmit).toHaveBeenCalledTimes(1);
  expect(mockIoEmit.mock.calls[0][0]).toBe("isRead");
  expect(mockIoEmit.mock.calls[0][1]).toBe(beforeNotification._id);
});
