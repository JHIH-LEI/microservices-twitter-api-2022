import { Event } from "./base-event";
import amqp from "amqplib";

export abstract class Listener<E extends Event> {
  abstract queue: E["queue"];
  protected connection: amqp.Connection;
  abstract channel: amqp.Channel;

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

  protected async consumeFromQueue(
    cb: (parsedContent: E["content"]) => Promise<void>
  ) {
    const outerThis = this;
    this.channel.consume(this.queue, async function (message) {
      if (message === null) {
        console.log("consumer cancelled by server");
      } else {
        const parsedContent = outerThis.parseContent(message.content);
        await cb(parsedContent);
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
