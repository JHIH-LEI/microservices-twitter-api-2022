import {
  Publisher,
  Queue,
  TweetUpdatedEvent,
} from "@domosideproject/twitter-common";
import { channel } from "../app";

export class TweetUpdatedPublisher extends Publisher<TweetUpdatedEvent> {
  readonly queue = Queue.TweetUpdated;
  readonly channel = channel;
}
