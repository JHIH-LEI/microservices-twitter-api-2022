import {
  NotificationCreatedEvent,
  Publisher,
  Queue,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../index";

export class NotificationCreatedPublisher extends Publisher<NotificationCreatedEvent> {
  readonly queue = Queue.NotificationCreated;
  channel = senderChannel;
}
