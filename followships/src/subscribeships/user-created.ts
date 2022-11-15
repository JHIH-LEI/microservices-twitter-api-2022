import {
  Listener,
  Queue,
  UserCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { db } from "../models";

export class UserCreatedConsumer extends Listener<UserCreatedEvent> {
  readonly queue = Queue.UserCreated;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: UserCreatedEvent["content"],
    message: Message
  ) {
    const { id, account, avatar, version, name, createdAt, updatedAt } =
      content;
    await db.User.create({
      id,
      avatar,
      account,
      version,
      name,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    });
  }
}
