import {
  Listener,
  LikeCreatedEvent,
  Queue,
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";
import { RedisOperator } from "../services/redis-operator";

export class LikeCreatedConsumer extends Listener<LikeCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = Queue.LikeCreated;

  async consumeCallBack(
    content: LikeCreatedEvent["content"],
    message: Message
  ) {
    const { createdAt, userId, name, avatar, tweetId } = content;

    // 找到推文所有者是誰，去redis看
    const notifyUserId = await RedisOperator.getTweetOwnerId(tweetId);
    const notification: NotificationCreatedContent = {
      createdAt,
      id: tweetId,
      type: NotificationType.Like,
      main: "",
      user: {
        name,
        avatar,
        id: userId,
      },
      notifyUserIds: notifyUserId === null ? [] : [notifyUserId],
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
