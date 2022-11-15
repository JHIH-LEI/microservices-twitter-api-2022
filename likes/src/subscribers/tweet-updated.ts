import {
  DBError,
  Listener,
  Queue,
  TweetUpdatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { Tweet } from "../models/tweet";

export class TweetUpdatedConsumer extends Listener<TweetUpdatedEvent> {
  readonly queue = Queue.TweetUpdated;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: TweetUpdatedEvent["content"],
    message: Message
  ) {
    const { id, description, updatedAt, version } = content;
    const tweet = await Tweet.findByVersionOrder({ id, version }).catch(
      (err: any) => {
        console.error(err);
        throw new DBError(JSON.stringify(err));
      }
    );

    if (tweet === null) {
      return;
    }

    tweet.description = description;
    tweet.updatedAt = new Date(updatedAt);

    await tweet.save().catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
  }
}
