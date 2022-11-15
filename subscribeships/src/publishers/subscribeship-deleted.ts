import {
  Publisher,
  Queue,
  SubscribeshipDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class SubscribeshipDeletedPublisher extends Publisher<SubscribeshipDeletedEvent> {
  readonly queue = Queue.SubscribeshipDeleted;
  readonly channel = senderChannel;
}
