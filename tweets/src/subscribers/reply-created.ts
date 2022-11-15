import {
  ReplyCreatedEvent,
  Listener,
  Queue,
  DBError,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import mongoose from "mongoose";
import { listenerChannel } from "../app";
import { Reply } from "../models/reply";

export class ReplyCreatedConsumer extends Listener<ReplyCreatedEvent> {
  readonly queue = Queue.ReplyCreated;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: ReplyCreatedEvent["content"],
    message: Message
  ) {
    const { id, tweetId, version } = content;

    const reply = Reply.build({
      id: new mongoose.Types.ObjectId(id),
      tweetId: new mongoose.Types.ObjectId(tweetId),
      version,
    });

    await reply.save().catch((err: any) => {
      throw new DBError(`add new reply error: ${JSON.stringify(err)}`);
    });
  }
}
