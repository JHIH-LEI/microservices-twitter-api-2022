import {
  getQueueName,
  Publisher,
  Service,
  ReplyCreatedEvent,
  BindingKey,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class ReplyCreatedPublisher extends Publisher<ReplyCreatedEvent> {
  readonly queue = getQueueName(Service.Tweet, this.routingKey);
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.ReplyCreated;
}
