import {
  DBError,
  LikeDeletedEvent,
  Listener,
  Queue,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import mongoose from "mongoose";
import { listenerChannel } from "../app";
import { Like } from "../models/like";

export class LikeDeletedConsumer extends Listener<LikeDeletedEvent> {
  readonly queue = Queue.LikeDeleted;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: LikeDeletedEvent["content"],
    message: Message
  ) {
    const { id } = content;

    await Like.deleteOne({ id }).catch((err: any) => {
      throw new DBError(`delete like error: ${JSON.stringify(err)}`);
    });
  }
}
