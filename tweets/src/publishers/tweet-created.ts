import {
  Publisher,
  Queue,
  TweetCreatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetCreatedPublisher extends Publisher<TweetCreatedEvent> {
  readonly queue = Queue.TweetCreated;
  readonly channel = senderChannel;
}
