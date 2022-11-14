import {
  Listener,
  Queue,
  UserCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { db } from "../models/index";

export class UserCreatedConsumer extends Listener<UserCreatedEvent> {
  readonly queue = Queue.UserCreated;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: UserCreatedEvent["content"],
    message: Message
  ) {
    const { id } = content;
    await db.User.create({ id }).catch((err) => console.error(err));
  }
}
