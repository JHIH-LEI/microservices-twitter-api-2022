import {
  DBError,
  Listener,
  Queue,
  UserCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { listenerChannel } from "../app";
import { User } from "../models/user";

export class UserCreatedConsumer extends Listener<UserCreatedEvent> {
  readonly queue = Queue.UserCreated;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: UserCreatedEvent["content"],
    message: Message
  ) {
    const { id, account, avatar, name, createdAt, updatedAt, version } =
      content;
    const user = User.build({
      _id: new Types.ObjectId(id),
      name,
      avatar,
      account,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      version,
    });

    await user.save().catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
  }
}
