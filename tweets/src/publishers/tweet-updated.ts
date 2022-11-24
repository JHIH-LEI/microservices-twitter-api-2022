import {
  BindingKey,
  Publisher,
  TweetUpdatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetUpdatedPublisher extends Publisher<TweetUpdatedEvent> {
  readonly channel = senderChannel;
  readonly routingKey: BindingKey = BindingKey.TweetUpdated;
}
