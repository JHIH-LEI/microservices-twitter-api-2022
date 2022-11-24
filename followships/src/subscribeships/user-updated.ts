import {
  BindingKey,
  getQueueName,
  Listener,
  Service,
  UserUpdatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { db } from "../models";

export class UserUpdatedConsumer extends Listener<UserUpdatedEvent> {
  readonly queue = getQueueName(Service.User, this.bindingKey);
  readonly channel = listenerChannel;
  readonly bindingKey: BindingKey = BindingKey.UserUpdated;

  async consumeCallBack(
    content: UserUpdatedEvent["content"],
    message: Message
  ) {
    const { id, account, avatar, version, name, updatedAt } = content;
    await db.User.update(
      { avatar, account, version, name, updatedAt: new Date(updatedAt) },
      { where: { id }, individualHooks: true }
    ).catch((err: any) => console.error(JSON.stringify(err)));
  }
}
