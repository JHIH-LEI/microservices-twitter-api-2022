import {
  Listener,
  ReplyCreatedEvent,
  Service,
  NotificationCreatedContent,
  NotificationType,
  getQueueName,
  BindingKey,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";
import { RedisOperator } from "../services/redis-operator";

export class ReplyCreatedConsumer extends Listener<ReplyCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = getQueueName(Service.Tweet, this.bindingKey);
  readonly bindingKey: BindingKey = BindingKey.ReplyCreated;
  readonly durable: boolean = true;

  async consumeCallBack(
    content: ReplyCreatedEvent["content"],
    message: Message
  ) {
    const { createdAt, userId, tweetId, comment } = content;

    // 找到推文所有者是誰，去redis看

    const notifyUserId = await RedisOperator.getTweetOwnerId(tweetId);
    const notification: NotificationCreatedContent = {
      createdAt,
      id: tweetId,
      type: NotificationType.Reply,
      main: comment,
      userId,
      notifyUserIds: notifyUserId ? [notifyUserId] : [],
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
