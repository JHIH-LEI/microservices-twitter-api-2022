import {
  UserUpdatedEvent,
  Listener,
  Service,
  DBError,
  BindingKey,
  getQueueName,
} from "@domosideproject/twitter-common";
import { Channel, Connection, Message } from "amqplib";
import { User } from "../models/user";

export class UserUpdatedConsumer extends Listener<UserUpdatedEvent> {
  readonly queue = getQueueName(Service.User, this.bindingKey);
  channel;
  readonly bindingKey: BindingKey = BindingKey.UserUpdated;
  readonly durable: boolean = true;

  constructor(connection: Connection, channel: Channel) {
    super(connection);
    this.channel = channel;
  }

  async consumeCallBack(
    content: UserUpdatedEvent["content"],
    message: Message
  ) {
    const { id, version, name, avatar } = content;

    const canUpdatedUser = await User.findByVersionOrder({ id, version }).catch(
      (err: any) => {
        throw new DBError(`find updated user db error: ${JSON.stringify(err)}`);
      }
    );

    if (canUpdatedUser === null) {
      return;
    }

    canUpdatedUser.name = name;
    canUpdatedUser.avatar = avatar;

    await canUpdatedUser.save().catch((err: any) => {
      throw new DBError(`update user error: ${JSON.stringify(err)}`);
    });
  }
}
