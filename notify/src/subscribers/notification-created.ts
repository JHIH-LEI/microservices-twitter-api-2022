import {
  ConflictError,
  DBError,
  Listener,
  NotificationCreatedContent,
  NotificationCreatedEvent,
  Queue,
} from "@domosideproject/twitter-common";
import { Channel, Message } from "amqplib";
import mongoose from "mongoose";
import { Notification } from "../models/notification";
import { User } from "../models/user";
import { listenerChannel, io } from "../index";
import { RedisOperator } from "../services/redis-operator";
import { NotifyPopupContent } from "../types";

export class NotificationCreatedConsumer extends Listener<NotificationCreatedEvent> {
  readonly queue = Queue.NotificationCreated;
  readonly channel: Channel = listenerChannel;

  async consumeCallBack(
    parsedContent: NotificationCreatedContent,
    message: Message
  ): Promise<void> {
    const { id, main, createdAt, type, userId, notifyUserIds } = parsedContent;

    const notifySocketsIn2D = await Promise.all(
      notifyUserIds.map((receiverId) =>
        RedisOperator.getNotifyUserSocketIds(receiverId)
      )
    ).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
    const notifySockets = notifySocketsIn2D.flat(1);
    // create notification record in database
    await Promise.all(
      notifyUserIds.map((receiverId) =>
        Notification.create({
          id: new mongoose.Types.ObjectId(id),
          main,
          type,
          isRead: false,
          createdAt: new Date(createdAt),
          triggerId: new mongoose.Types.ObjectId(userId),
          receiverId: new mongoose.Types.ObjectId(receiverId),
        })
      )
    ).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    // get trigger user name, avatar
    const triggerUser = await User.findById(userId).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    if (triggerUser === null) {
      throw new ConflictError("trigger user not exist yet");
    }

    // TODO: refactor 其實還有更好的做法，但現在先這樣。https://stackoverflow.com/questions/4647348/send-message-to-specific-client-with-socket-io-and-node-js
    // emit

    const notifyContent: NotifyPopupContent = {
      id,
      main,
      type,
      userId,
      createdAt,
      name: triggerUser.name,
      avatar: triggerUser.avatar,
    };

    notifySockets.forEach((socketId) => {
      io.to(socketId).emit("notify", notifyContent);
    });
  }
}
