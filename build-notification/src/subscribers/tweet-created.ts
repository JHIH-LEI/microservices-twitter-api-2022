import {
  BindingKey,
  getQueueName,
  Listener,
  NotificationCreatedContent,
  NotificationType,
  Service,
  TweetCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib/properties";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";
import { RedisOperator } from "../services/redis-operator";

export class TweetCreatedConsumer extends Listener<TweetCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = getQueueName(Service.Tweet, this.bindingKey);
  readonly bindingKey: BindingKey = BindingKey.TweetCreated;
  readonly durable: boolean = true;

  async consumeCallBack(
    content: TweetCreatedEvent["content"],
    message: Message
  ) {
    const { userId, id, description, createdAt } = content;

    const [subscribers] = await Promise.all([
      RedisOperator.getSubscribers(userId),
      RedisOperator.addTweetOwnerId({ tweetId: id, userId }),
    ]);
    console.log("subscribers:");
    console.log(subscribers);
    const notification: NotificationCreatedContent = {
      id,
      userId,
      type: NotificationType.Tweet,
      createdAt,
      main: description,
      notifyUserIds: subscribers,
    };

    await new NotificationCreatedPublisher(this.connection).publish(
      notification
    );
  }
}
