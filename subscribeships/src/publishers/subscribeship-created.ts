import {
  Publisher,
  Queue,
  SubscribeshipCreatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class SubscribeshipCreatedPublisher extends Publisher<SubscribeshipCreatedEvent> {
  readonly queue = Queue.SubscribeshipCreated;
  readonly channel = senderChannel;
}
