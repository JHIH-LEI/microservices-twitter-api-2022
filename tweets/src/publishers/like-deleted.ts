import {
  LikeDeletedEvent,
  Publisher,
  Queue,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class LikeDeletedPublishers extends Publisher<LikeDeletedEvent> {
  readonly queue = Queue.LikeDeleted;
  readonly channel = senderChannel;
}
