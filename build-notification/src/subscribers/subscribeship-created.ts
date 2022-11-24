import {
  Listener,
  SubscribeshipCreatedEvent,
  NotificationCreatedContent,
  NotificationType,
  getQueueName,
  Service,
  BindingKey,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";
import { RedisOperator } from "../services/redis-operator";

export class SubscribeshipCreatedConsumer extends Listener<SubscribeshipCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = getQueueName(Service.Subscribeship, this.bindingKey);
  readonly bindingKey: BindingKey = BindingKey.SubscribeshipCreated;
  readonly durable: boolean = true;

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
