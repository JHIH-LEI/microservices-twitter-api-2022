import {
  BindingKey,
  Publisher,
  SubscribeshipDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class SubscribeshipDeletedPublisher extends Publisher<SubscribeshipDeletedEvent> {
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.SubscribeshipDeleted;
}
