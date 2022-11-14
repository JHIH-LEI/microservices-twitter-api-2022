import {
  DBError,
  Listener,
  Queue,
  ReplyDeletedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { listenerChannel } from "../app";
import { Reply } from "../models/reply";

export class ReplyDeletedConsumer extends Listener<ReplyDeletedEvent> {
  readonly queue = Queue.ReplyDeleted;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: ReplyDeletedEvent["content"],
    message: Message
  ) {
    const { id, version } = content;
    const reply = await Reply.findOneAndDeletedByVersionOrder({
      id,
      version,
    }).catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    if (reply === null) {
      return;
    }
  }
}
