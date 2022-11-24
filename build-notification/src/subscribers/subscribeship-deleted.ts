import {
  Listener,
  SubscribeshipDeletedEvent,
  Service,
  getQueueName,
  BindingKey,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { listenerChannel } from "../index";
import { RedisOperator } from "../services/redis-operator";

export class SubscribeshipDeletedConsumer extends Listener<SubscribeshipDeletedEvent> {
  readonly channel = listenerChannel;
  readonly queue = getQueueName(Service.Subscribeship, this.bindingKey);
  readonly bindingKey: BindingKey = BindingKey.SubscribeshipDeleted;
  readonly durable: boolean = true;

  async consumeCallBack(
    content: SubscribeshipDeletedEvent["content"],
    message: Message
  ) {
    const { subscriberId, subscribingId } = content;

    await RedisOperator.removeSubscribers({ subscriberId, subscribingId });
  }
}
