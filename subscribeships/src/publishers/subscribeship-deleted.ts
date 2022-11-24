import {
  BindingKey,
  Publisher,
  SubscribeshipDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class SubscribeshipDeletedPublisher extends Publisher<SubscribeshipDeletedEvent> {
  readonly channel = senderChannel;
  readonly routingKey: BindingKey = BindingKey.SubscribeshipDeleted;
}
