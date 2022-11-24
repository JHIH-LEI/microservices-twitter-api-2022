import {
  BindingKey,
  getQueueName,
  LikeCreatedEvent,
  Publisher,
  Service,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class LikeCreatedPublishers extends Publisher<LikeCreatedEvent> {
  readonly queue = getQueueName(Service.Tweet, this.routingKey);
  readonly routingKey: BindingKey = BindingKey.LikeCreated;
  readonly channel = senderChannel;
  readonly durable: boolean = true;
}
