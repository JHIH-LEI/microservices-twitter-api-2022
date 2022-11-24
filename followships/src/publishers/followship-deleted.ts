import {
  FollowshipDeletedEvent,
  Publisher,
  Queue,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class FollowshipDeletedPublisher extends Publisher<FollowshipDeletedEvent> {
  readonly queue = Queue.FollowshipDeleted;
  readonly channel = senderChannel;
}
