import {
  DBError,
  Listener,
  Queue,
  TweetDeletedEvent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../app";
import { Tweet } from "../models/tweet";

export class TweetDeletedConsumer extends Listener<TweetDeletedEvent> {
  readonly queue = Queue.TweetDeleted;
  // @ts-ignore
  readonly channel = listenerChannel;

  async consumeCallBack(
    content: TweetDeletedEvent["content"],
    message: Message
  ) {
    const { id, version } = content;

    const tweet = await Tweet.findOne({
      id,
      version,
    }).catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    if (tweet === null) {
      return;
    }

    // remove will trigger hook to delete all replated reply records
    await tweet.remove();
  }
}
