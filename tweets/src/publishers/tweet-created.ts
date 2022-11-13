import {
  Publisher,
  Queue,
  TweetCreatedEvent,
} from "@domosideproject/twitter-common";
import { channel } from "../app";

export class TweetCreatedPublisher extends Publisher<TweetCreatedEvent> {
  readonly queue = Queue.TweetCreated;
  readonly channel = channel;
}
