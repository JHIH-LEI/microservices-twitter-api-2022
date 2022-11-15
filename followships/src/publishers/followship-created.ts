import {
  FollowshipCreatedEvent,
  Publisher,
  Queue,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class FollowshipCreatedPublisher extends Publisher<FollowshipCreatedEvent> {
  readonly queue = Queue.FollowshipCreated;
  readonly channel = senderChannel;
}
