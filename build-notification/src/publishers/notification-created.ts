import {
  BindingKey,
  NotificationCreatedEvent,
  Publisher,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../index";

export class NotificationCreatedPublisher extends Publisher<NotificationCreatedEvent> {
  channel = senderChannel;
  readonly routingKey: BindingKey = BindingKey.NotificationCreated;
}
