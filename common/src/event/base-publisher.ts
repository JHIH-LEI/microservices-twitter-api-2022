import { Event } from "./base-event";
import amqp from "amqplib";
import isObject from "lodash.isobject";

export abstract class Publisher<E extends Event> {
  protected connection: amqp.Connection;
  abstract channel: amqp.Channel;
  private exchangeName = "twitter";
  private exchangeType = "direct";
  abstract routingKey: E["bindingKey"];
  abstract durable: boolean;

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
      durable: this.durable,
    });
    const bufferContent = this.parseContent(content);
    this.channel.publish(this.exchangeName, this.routingKey, bufferContent, {
      ...options,
      persistent: this.durable,
    });
  }
}

// const test = new xxxxPublisher(connect).publish(data);
