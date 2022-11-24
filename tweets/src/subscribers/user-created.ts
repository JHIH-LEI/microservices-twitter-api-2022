import {
  UserCreatedEvent,
  Listener,
  Service,
  DBError,
  getQueueName,
  BindingKey,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import mongoose from "mongoose";
import { listenerChannel } from "../app";
import { User } from "../models/user";

export class UserCreatedConsumer extends Listener<UserCreatedEvent> {
  readonly queue = getQueueName(Service.User, this.bindingKey);
  readonly channel = listenerChannel;
  readonly bindingKey: BindingKey = BindingKey.UserCreated;
  readonly durable: boolean = true;

  async consumeCallBack(
    content: UserCreatedEvent["content"],
    message: Message
  ) {
    const { id, account, avatar, name, version, createdAt, updatedAt } =
      content;

    const user = User.build({
      _id: new mongoose.Types.ObjectId(id),
      name,
      avatar,
      account,
      version,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    });

    await user.save().catch((err: any) => {
      throw new DBError(`add new user error: ${JSON.stringify(err)}`);
    });
  }
}
