import {
  BindingKey,
  FollowshipCreatedEvent,
  Publisher,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class FollowshipCreatedPublisher extends Publisher<FollowshipCreatedEvent> {
  readonly routingKey: BindingKey = BindingKey.FollowshipCreated;
  readonly channel = senderChannel;
}
