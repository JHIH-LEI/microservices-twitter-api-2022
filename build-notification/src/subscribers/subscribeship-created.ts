import {
  Listener,
  SubscribeshipCreatedEvent,
  Queue,
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";
import { RedisOperator } from "../services/redis-operator";

export class SubscribeshipCreatedConsumer extends Listener<SubscribeshipCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = Queue.SubscribeshipCreated;

  async consumeCallBack(
    content: SubscribeshipCreatedEvent["content"],
    message: Message
  ) {
    const { createdAt, avatar, subscriberId, subscribingId, name } = content;

    await RedisOperator.addSubscribers({ subscriberId, subscribingId });

    const notification: NotificationCreatedContent = {
      createdAt,
      id: subscriberId,
      type: NotificationType.Subscribe,
      main: "",
      user: {
        name,
        avatar,
        id: subscriberId,
      },
      notifyUserIds: [subscribingId],
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
