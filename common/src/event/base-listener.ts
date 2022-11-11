import { Event } from "./base-event";
import amqp from "amqplib";

export abstract class Listener<E extends Event> {
  abstract queue: E["queue"];
  protected connection: amqp.Connection;
  abstract channel: amqp.Channel;
  abstract consumeCallBack: (parsedContent: E["content"]) => Promise<void>;

  constructor(connection: amqp.Connection) {
    this.connection = connection;
  }

  private parseContent(content: Buffer): string | { [key: string]: any } {
    let parsedContent;
    try {
      parsedContent = JSON.parse(content.toString());
    } catch (err) {
      parsedContent = content.toString();
    }
    return parsedContent;
  }

  async consumeFromQueue() {
    const outerThis = this;
    this.channel.assertQueue(this.queue);
    this.channel.consume(this.queue, async function (message) {
      if (message === null) {
        console.log("consumer cancelled by server");
      } else {
        const parsedContent = outerThis.parseContent(message.content);
        await outerThis.consumeCallBack(parsedContent);
        outerThis.channel.ack(message);
      }
    });
  }
}

// 最後希望這樣用
// new xxxListener(connection,channel).consumeFromQueue(data=> {
//   我自己的操作邏輯
// }
//})
