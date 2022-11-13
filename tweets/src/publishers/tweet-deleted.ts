import {
  Publisher,
  Queue,
  TweetDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetDeletedPublisher extends Publisher<TweetDeletedEvent> {
  readonly queue = Queue.TweetDeleted;
  readonly channel = senderChannel;
}
