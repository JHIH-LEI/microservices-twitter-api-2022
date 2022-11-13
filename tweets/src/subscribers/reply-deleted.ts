import {
  ReplyDeletedEvent,
  Listener,
  Queue,
  DBError,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { Reply } from "../models/reply";

export class ReplyDeletedConsumer extends Listener<ReplyDeletedEvent> {
  readonly queue = Queue.ReplyDeleted;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: ReplyDeletedEvent["content"],
    message: Message
  ) {
    const { id } = content;

    await Reply.findByIdAndDelete(id).catch((err: any) => {
      throw new DBError(`delete reply error: ${JSON.stringify(err)}`);
    });
  }
}
