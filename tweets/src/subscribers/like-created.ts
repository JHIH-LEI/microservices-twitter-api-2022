import {
  LikeCreatedEvent,
  Listener,
  Queue,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import mongoose from "mongoose";
import { listenerChannel } from "../app";
import { Like } from "../models/like";

export class LikeCreatedConsumer extends Listener<LikeCreatedEvent> {
  readonly queue = Queue.LikeCreated;
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: LikeCreatedEvent["content"],
    message: Message
  ) {
    const { id, userId, tweetId, createdAt } = content;

    const like = Like.build({
      id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
      tweetId: new mongoose.Types.ObjectId(tweetId),
      createdAt: new Date(createdAt),
    });

    await like.save();
  }
}
