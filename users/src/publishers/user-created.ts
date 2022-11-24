import {
  BindingKey,
  Publisher,
  UserCreatedEvent,
} from "@domosideproject/twitter-common";
import { Channel } from "amqplib";
import { channel } from "../app";

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  readonly channel: Channel = channel;
  readonly routingKey = BindingKey.UserCreated;
  readonly durable: boolean = true;
}
