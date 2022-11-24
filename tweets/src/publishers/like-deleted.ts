import {
  BindingKey,
  LikeDeletedEvent,
  Publisher,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class LikeDeletedPublishers extends Publisher<LikeDeletedEvent> {
  readonly channel = senderChannel;
  readonly routingKey: BindingKey = BindingKey.LikeDeleted;
}
