import {
  BindingKey,
  Publisher,
  Service,
  ReplyDeletedEvent,
  getQueueName,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";
import amqp from "amqplib";

export class ReplyDeletedPublisher extends Publisher<ReplyDeletedEvent> {
  readonly queue = getQueueName(Service.Tweet, this.routingKey);
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.ReplyDeleted;
}
