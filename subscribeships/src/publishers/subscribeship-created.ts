import {
  BindingKey,
  Publisher,
  SubscribeshipCreatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class SubscribeshipCreatedPublisher extends Publisher<SubscribeshipCreatedEvent> {
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.SubscribeshipCreated;
}
