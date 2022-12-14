import {
  BindingKey,
  Publisher,
  ReplyDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class ReplyDeletedPublisher extends Publisher<ReplyDeletedEvent> {
  readonly channel = senderChannel;
  readonly routingKey: BindingKey = BindingKey.ReplyDeleted;
}
