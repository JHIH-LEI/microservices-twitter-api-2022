import {
  DBError,
  Listener,
  Queue,
  ReplyCreatedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { listenerChannel } from "../app";
import { Reply } from "../models/reply";

export class ReplyCreatedConsumer extends Listener<ReplyCreatedEvent> {
  readonly queue = Queue.ReplyCreated;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: ReplyCreatedEvent["content"],
    message: Message
  ) {
    const { id, tweetId, createdAt, updatedAt, version } = content;
    const reply = Reply.build({
      _id: new Types.ObjectId(id),
      tweetId: new Types.ObjectId(tweetId),
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      version,
    });

    await reply.save().catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
  }
}
