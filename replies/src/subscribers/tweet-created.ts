import {
  DBError,
  Listener,
  Queue,
  TweetCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { listenerChannel } from "../app";
import { Tweet } from "../models/tweet";

export class TweetCreatedConsumer extends Listener<TweetCreatedEvent> {
  readonly queue = Queue.TweetCreated;
  // @ts-ignore
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: TweetCreatedEvent["content"],
    message: Message
  ) {
    const { id, userId } = content;
    const tweet = Tweet.build({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    await tweet.save().catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
  }
}
