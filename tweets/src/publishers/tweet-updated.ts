import {
  BindingKey,
  Publisher,
  TweetUpdatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetUpdatedPublisher extends Publisher<TweetUpdatedEvent> {
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.TweetUpdated;
}
