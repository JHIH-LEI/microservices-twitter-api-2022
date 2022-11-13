import {
  Listener,
  ReplyCreatedEvent,
  Queue,
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";
import { RedisOperator } from "../services/redis-operator";

export class ReplyCreatedConsumer extends Listener<ReplyCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = Queue.ReplyCreated;

  async consumeCallBack(
    content: ReplyCreatedEvent["content"],
    message: Message
  ) {
    const { createdAt, userId, avatar, tweetId, comment } = content;

    // 找到推文所有者是誰，去redis看

    const notifyUserId = await RedisOperator.getTweetOwnerId(tweetId);
    const notification: NotificationCreatedContent = {
      createdAt,
      id: tweetId,
      type: NotificationType.Reply,
      main: comment,
      user: {
        name: "",
        avatar,
        id: userId,
      },
      notifyUserIds: notifyUserId ? [notifyUserId] : [],
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
