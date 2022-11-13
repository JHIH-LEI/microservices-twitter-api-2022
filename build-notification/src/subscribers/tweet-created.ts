import {
  Listener,
  NotificationCreatedContent,
  NotificationType,
  Queue,
  TweetCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib/properties";
import { listenerChannel } from "../index";
import { NotificationCreatedPublisher } from "../publishers/notification-created";
import { RedisOperator } from "../services/redis-operator";

export class TweetCreatedConsumer extends Listener<TweetCreatedEvent> {
  readonly channel = listenerChannel;
  readonly queue = Queue.TweetCreated;

  async consumeCallBack(
    content: TweetCreatedEvent["content"],
    message: Message
  ) {
    const { userId, id, name, avatar, description, createdAt } = content;

    const [subscribers] = await Promise.all([
      RedisOperator.getSubscribers(userId),
      RedisOperator.addTweetOwnerId({ tweetId: id, userId }),
    ]);
    console.log("subscribers:");
    console.log(subscribers);
    const notification: NotificationCreatedContent = {
      id,
      user: {
        id: userId,
        name,
        avatar,
      },
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
