import {
  BindingKey,
  getQueueName,
  Publisher,
  Service,
  TweetDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class TweetDeletedPublisher extends Publisher<TweetDeletedEvent> {
  readonly queue = getQueueName(Service.Tweet, this.routingKey);
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.TweetDeleted;
}
