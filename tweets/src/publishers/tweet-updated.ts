import {
  Publisher,
  Queue,
  TweetUpdatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetUpdatedPublisher extends Publisher<TweetUpdatedEvent> {
  readonly queue = Queue.TweetUpdated;
  readonly channel = senderChannel;
}
