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
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: TweetCreatedEvent["content"],
    message: Message
  ) {
    const { id, userId, description, createdAt, updatedAt, version } = content;
    const tweet = Tweet.build({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      description,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      version,
    });

    await tweet.save().catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
  }
}
