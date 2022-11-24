import {
  Listener,
  LikeCreatedEvent,
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

export class LikeCreatedConsumer extends Listener<LikeCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = getQueueName(Service.Tweet, this.bindingKey);
  readonly bindingKey: BindingKey = BindingKey.LikeCreated;

  async consumeCallBack(
    content: LikeCreatedEvent["content"],
    message: Message
  ) {
    const { createdAt, userId, tweetId } = content;

    // 找到推文所有者是誰，去redis看
    const notifyUserId = await RedisOperator.getTweetOwnerId(tweetId);
    const notification: NotificationCreatedContent = {
      createdAt,
      id: tweetId,
      type: NotificationType.Like,
      main: "",
      userId,
      notifyUserIds: notifyUserId === null ? [] : [notifyUserId],
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
