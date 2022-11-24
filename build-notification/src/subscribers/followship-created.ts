import {
  FollowshipCreatedEvent,
  Listener,
  NotificationCreatedContent,
  NotificationType,
  getQueueName,
  Service,
  BindingKey,
} from "@domosideproject/twitter-common";
import { Channel, Message } from "amqplib";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";

export class FollowshipCreatedConsumer extends Listener<FollowshipCreatedEvent> {
  channel: Channel = listenerChannel;
  readonly queue = getQueueName(Service.Followship, this.bindingKey);
  readonly bindingKey: BindingKey = BindingKey.FollowshipCreated;
  readonly durable: boolean = true;

  async consumeCallBack(
    content: FollowshipCreatedEvent["content"],
    message: Message
  ) {
    const { followerId, followingId, createdAt } = content;

    // 轉成notification要的資料，發事件
    const notification: NotificationCreatedContent = {
      id: followerId,
      userId: followerId,
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
