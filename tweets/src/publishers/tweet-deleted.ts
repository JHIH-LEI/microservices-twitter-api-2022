import {
  Publisher,
  Queue,
  TweetDeletedEvent,
} from "@domosideproject/twitter-common";
import { channel } from "../app";

export class TweetDeletedPublisher extends Publisher<TweetDeletedEvent> {
  readonly queue = Queue.TweetDeleted;
  readonly channel = channel;
}
