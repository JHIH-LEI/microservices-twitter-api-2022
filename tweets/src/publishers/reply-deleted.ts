import {
  Publisher,
  Queue,
  ReplyDeletedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";
import amqp from "amqplib";

export class ReplyDeletedPublisher extends Publisher<ReplyDeletedEvent> {
  readonly queue = Queue.ReplyDeleted;
  readonly channel: amqp.Channel = senderChannel;
}
