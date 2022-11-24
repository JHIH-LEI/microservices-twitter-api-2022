import {
  BindingKey,
  LikeDeletedEvent,
  Publisher,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class LikeDeletedPublishers extends Publisher<LikeDeletedEvent> {
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.LikeDeleted;
}
