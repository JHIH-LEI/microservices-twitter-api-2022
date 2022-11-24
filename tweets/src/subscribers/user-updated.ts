import {
  UserUpdatedEvent,
  Listener,
  Service,
  DBError,
  BindingKey,
  getQueueName,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { User } from "../models/user";

export class UserUpdatedConsumer extends Listener<UserUpdatedEvent> {
  readonly queue = getQueueName(Service.User, this.bindingKey);
  readonly channel = listenerChannel;
  readonly bindingKey: BindingKey = BindingKey.UserUpdated;

  async consumeCallBack(
    content: UserUpdatedEvent["content"],
    message: Message
  ) {
    const { id, version, name, account, avatar, updatedAt } = content;

    const canUpdatedUser = await User.findByVersionOrder({ id, version }).catch(
      (err: any) => {
        throw new DBError(`find updated user db error: ${JSON.stringify(err)}`);
      }
    );

    if (canUpdatedUser === null) {
      return;
    }

    canUpdatedUser.name = name;
    canUpdatedUser.account = account;
    canUpdatedUser.avatar = avatar;
    canUpdatedUser.updatedAt = new Date(updatedAt);

    await canUpdatedUser.save().catch((err: any) => {
      throw new DBError(`update user error: ${JSON.stringify(err)}`);
    });
  }
}
