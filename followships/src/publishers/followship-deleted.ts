import {
  BindingKey,
  FollowshipDeletedEvent,
  Publisher,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class FollowshipDeletedPublisher extends Publisher<FollowshipDeletedEvent> {
  readonly channel = senderChannel;
  readonly routingKey: BindingKey = BindingKey.FollowshipDeleted;
  readonly durable: boolean = true;
}
