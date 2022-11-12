import {
  FollowshipCreatedEvent,
  Listener,
  Queue,
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";
import { Channel, Message } from "amqplib";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";

export class FollowshipCreatedConsumer extends Listener<FollowshipCreatedEvent> {
  channel: Channel = listenerChannel;
  readonly queue = Queue.FollowshipCreated;

  async consumeCallBack(
    content: FollowshipCreatedEvent["content"],
    message: Message
  ) {
    const { followerId, followingId, name, avatar, createdAt } = content;
    // 轉成notification要的資料，發事件
    const notification: NotificationCreatedContent = {
      id: followerId,
      user: {
        id: followerId,
        name,
        avatar,
      },
      createdAt,
      main: "",
      type: NotificationType.Follow,
      notifyUserIds: [followingId],
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
