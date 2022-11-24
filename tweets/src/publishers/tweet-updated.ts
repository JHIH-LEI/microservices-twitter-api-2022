import {
  BindingKey,
  getQueueName,
  Publisher,
  Service,
  TweetUpdatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetUpdatedPublisher extends Publisher<TweetUpdatedEvent> {
  readonly queue = getQueueName(Service.Tweet, this.routingKey);
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.TweetUpdated;
}
