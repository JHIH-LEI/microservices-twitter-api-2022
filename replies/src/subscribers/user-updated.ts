import {
  DBError,
  Listener,
  Queue,
  UserUpdatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { User } from "../models/user";

export class UserUpdatedConsumer extends Listener<UserUpdatedEvent> {
  readonly queue = Queue.UserUpdated;
  // @ts-ignore
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: UserUpdatedEvent["content"],
    message: Message
  ) {
    const { id, account, avatar, name, updatedAt, version } = content;
    const user = await User.findByVersionOrder({
      id,
      version,
    });

    if (user === null) {
      return;
    }

    user.avatar = avatar;
    user.name = name;
    user.account = account;
    user.updatedAt = new Date(updatedAt);

    await user.save().catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
  }
}
