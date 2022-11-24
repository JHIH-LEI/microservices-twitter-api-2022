import {
  BindingKey,
  getQueueName,
  Listener,
  Service,
  UserCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { db } from "../models/index";

export class UserCreatedConsumer extends Listener<UserCreatedEvent> {
  readonly queue = getQueueName(Service.User, this.bindingKey);
  readonly channel = listenerChannel;
  readonly bindingKey: BindingKey = BindingKey.UserCreated;

  async consumeCallBack(
    content: UserCreatedEvent["content"],
    message: Message
  ) {
    const { id, name, avatar } = content;
    await db.User.create({ id, name, avatar }).catch((err) =>
      console.error(err)
    );
  }
}
