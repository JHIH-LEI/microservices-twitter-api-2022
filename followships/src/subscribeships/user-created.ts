import {
  BindingKey,
  getQueueName,
  Listener,
  Service,
  UserCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { db } from "../models";

export class UserCreatedConsumer extends Listener<UserCreatedEvent> {
  readonly queue = getQueueName(Service.User, this.bindingKey);
  readonly channel = listenerChannel;
  readonly bindingKey: BindingKey = BindingKey.UserCreated;

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
    }).catch((err) => console.error(JSON.stringify(err)));
  }
}
