import {
  BindingKey,
  getQueueName,
  Publisher,
  Service,
  TweetCreatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetCreatedPublisher extends Publisher<TweetCreatedEvent> {
  readonly queue = getQueueName(Service.Tweet, this.routingKey);
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.TweetCreated;
}
