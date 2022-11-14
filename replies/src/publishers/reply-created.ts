import {
  Publisher,
  Queue,
  ReplyCreatedEvent,
} from "@domosideproject/twitter-common";
import { senderChannel } from "../app";
import amqp from "amqplib";

export class ReplyCreatedPublisher extends Publisher<ReplyCreatedEvent> {
  readonly queue = Queue.ReplyCreated;
  // @ts-ignore
  readonly channel: amqp.Channel = senderChannel;
}
