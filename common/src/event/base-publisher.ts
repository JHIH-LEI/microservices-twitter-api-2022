import { Event } from "./base-event";
import amqp from "amqplib";
import isObject from "lodash.isobject";

export abstract class Publisher<E extends Event> {
  abstract queue: E["queue"];
  protected connection: amqp.Connection;
  abstract channel: amqp.Channel;

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
    await this.channel.assertQueue(this.queue);
    const bufferContent = this.parseContent(content);
    this.channel.sendToQueue(this.queue, bufferContent, options);
  }
}

// const test = new xxxxPublisher(connect).publish(data);
