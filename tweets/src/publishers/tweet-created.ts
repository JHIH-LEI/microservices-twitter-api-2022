import {
  BindingKey,
  Publisher,
  TweetCreatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetCreatedPublisher extends Publisher<TweetCreatedEvent> {
  readonly channel = senderChannel;
  readonly routingKey: BindingKey = BindingKey.TweetCreated;
}
