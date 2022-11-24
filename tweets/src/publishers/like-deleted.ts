import {
  BindingKey,
  getQueueName,
  LikeDeletedEvent,
  Publisher,
  Service,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";

export class LikeDeletedPublishers extends Publisher<LikeDeletedEvent> {
  readonly queue = getQueueName(Service.Tweet, this.routingKey);
  readonly channel = senderChannel;
  readonly durable: boolean = true;
  readonly routingKey: BindingKey = BindingKey.LikeDeleted;
}
