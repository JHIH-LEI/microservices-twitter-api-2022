import {
  UserCreatedEvent,
  Listener,
  Service,
  DBError,
  getQueueName,
  BindingKey,
} from "@domosideproject/twitter-common";
import { Channel, Connection, Message } from "amqplib";
import mongoose from "mongoose";
import { User } from "../models/user";

export class UserCreatedConsumer extends Listener<UserCreatedEvent> {
  readonly queue = getQueueName(Service.User, this.bindingKey);
  channel;
  readonly bindingKey: BindingKey = BindingKey.UserCreated;
  readonly durable: boolean = true;

  constructor(connection: Connection, channel: Channel) {
    super(connection);
    this.channel = channel;
  }

  async consumeCallBack(
    content: UserCreatedEvent["content"],
    message: Message
  ) {
    const { id, avatar, name, version } = content;

    const user = User.build({
      _id: new mongoose.Types.ObjectId(id),
      name,
      avatar,
      version,
    });

    await user.save().catch((err: any) => {
      throw new DBError(`add new user error: ${JSON.stringify(err)}`);
    });
  }
}
