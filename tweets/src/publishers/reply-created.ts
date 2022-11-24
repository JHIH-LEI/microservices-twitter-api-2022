import {
  Publisher,
  ReplyCreatedEvent,
  BindingKey,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class ReplyCreatedPublisher extends Publisher<ReplyCreatedEvent> {
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.ReplyCreated;
}
