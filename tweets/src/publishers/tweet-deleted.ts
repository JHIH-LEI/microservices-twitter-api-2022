import {
  BindingKey,
  Publisher,
  TweetDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetDeletedPublisher extends Publisher<TweetDeletedEvent> {
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.TweetDeleted;
}
