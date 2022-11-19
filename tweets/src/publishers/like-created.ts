import {
  LikeCreatedEvent,
  Publisher,
  Queue,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class LikeCreatedPublishers extends Publisher<LikeCreatedEvent> {
  readonly queue = Queue.LikeCreated;
  readonly channel = senderChannel;
}
