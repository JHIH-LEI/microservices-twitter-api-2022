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
    const { createdAt, subscriberId, subscribingId } = content;

    await RedisOperator.addSubscribers({ subscriberId, subscribingId });

    const notification: NotificationCreatedContent = {
      createdAt,
      id: subscriberId,
      type: NotificationType.Subscribe,
      main: "",
      userId: subscriberId,
      notifyUserIds: [subscribingId],
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
