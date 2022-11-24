import { Event } from "./base-event";
import amqp from "amqplib";
import isObject from "lodash.isobject";

export abstract class Publisher<E extends Event> {
  protected connection: amqp.Connection;
  abstract channel: amqp.Channel;
  private exchangeName = "twitter";
  private exchangeType = "direct";
  abstract routingKey: E["bindingKey"];

  constructor(connection: amqp.Connection) {
    this.connection = connection;
  }

  private parseContent(content: E["content"]): Buffer {
    let returnContent = Buffer.from(content);

    if (isObject(content)) {
      returnContent = Buffer.from(JSON.stringify(content));
    }

    return returnContent;
  }

  async publish(content: E["content"], options?: amqp.Options.Publish) {
    await this.channel.assertExchange(this.exchangeName, this.exchangeType, {
      durable: true,
    });
    const bufferContent = this.parseContent(content);
    this.channel.publish(this.exchangeName, this.routingKey, bufferContent, {
      ...options,
      persistent: true,
    });
  }
}

// const test = new xxxxPublisher(connect).publish(data);
