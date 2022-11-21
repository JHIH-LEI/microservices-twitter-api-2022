import dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import amqp from "amqplib";
import { FollowshipCreatedConsumer } from "./subscribers/followship-created";
import Redis from "ioredis";
import { TweetCreatedConsumer } from "./subscribers/tweet-created";
import { SubscribeshipCreatedConsumer } from "./subscribers/subscribeship-created";
import { SubscribeshipDeletedConsumer } from "./subscribers/subscribeship-deleted";
import { LikeCreatedConsumer } from "./subscribers/like-created";
import { ReplyCreatedConsumer } from "./subscribers/reply-created";

let connection: amqp.Connection;
let listenerChannel: amqp.Channel;
let senderChannel: amqp.Channel;
if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is required.");
}

const redis = new Redis(process.env.REDIS_URL);

const start = async () => {
  try {
    if (!process.env.RABBITMQ_URL) {
      throw new Error("RABBITMQ_URL is required.");
    }

    connection = await amqp.connect(process.env.RABBITMQ_URL!);
    listenerChannel = await connection.createChannel();
    senderChannel = await connection.createChannel();

    // subscribers:
    new FollowshipCreatedConsumer(connection).consumeFromQueue();
    new TweetCreatedConsumer(connection).consumeFromQueue();
    new SubscribeshipCreatedConsumer(connection).consumeFromQueue();
    new SubscribeshipDeletedConsumer(connection).consumeFromQueue();
    new LikeCreatedConsumer(connection).consumeFromQueue();
    new ReplyCreatedConsumer(connection).consumeFromQueue();
  } catch (err) {
    console.error(err);
  }
};

start();

export { connection, listenerChannel, senderChannel, redis };
