import {
  BindingKey,
  LikeCreatedEvent,
  Publisher,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class LikeCreatedPublishers extends Publisher<LikeCreatedEvent> {
  readonly routingKey: BindingKey = BindingKey.LikeCreated;
  readonly channel = senderChannel;
}
