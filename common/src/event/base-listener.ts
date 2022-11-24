import { Event } from "./base-event";
import amqp, { Message } from "amqplib";
import { getQueueName, Service } from "./queue";
import { UserCreatedEvent } from "./user-created-event";
import { BindingKey } from "./bindingKey";

export abstract class Listener<E extends Event> {
  abstract queue: string;
  protected connection: amqp.Connection;
  private exchangeName = "twitter";
  private exchangeType = "direct";
  abstract bindingKey: E["bindingKey"];
  abstract durable: boolean;

  abstract channel: amqp.Channel;
  abstract consumeCallBack(
    parsedContent: E["content"],
    message: amqp.Message
  ): Promise<void>;

  constructor(connection: amqp.Connection) {
    this.connection = connection;
  }

  private parseContent(content: Buffer): E["content"] {
    let parsedContent;
    try {
      parsedContent = JSON.parse(content.toString());
    } catch (err) {
      parsedContent = content.toString();
    }
    return parsedContent;
  }

  consumeFromQueue() {
    const outerThis = this;

    this.channel.assertExchange(this.exchangeName, this.exchangeType, {
      durable: this.durable,
    });
    this.channel.assertQueue(this.queue);
    this.channel.bindQueue(this.queue, this.exchangeName, this.bindingKey);

    this.channel.consume(
      this.queue,
      async function (message) {
        if (message === null) {
          console.log("consumer cancelled by server");
        } else {
          const parsedContent = outerThis.parseContent(message.content);
          await outerThis
            .consumeCallBack(parsedContent, message)
            .catch((err) => {
              console.error(err);
              return;
            });
          outerThis.channel.ack(message);
        }
      },
      { noAck: false }
    );
  }
}
