import dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import amqp from "amqplib";
import { FollowshipCreatedConsumer } from "./subscribers/followship-created";
import Redis from "ioredis";
import { getDBUrlBaseNodeEnv } from "@domosideproject/twitter-common";

let connection: amqp.Connection;
let listenerChannel: amqp.Channel;
let senderChannel: amqp.Channel;
let redis: Redis;
const start = async () => {
  try {
    if (!process.env.RABBITMQ_URL) {
      throw new Error("RABBITMQ_URL is required.");
    }

    const url = getDBUrlBaseNodeEnv();

    if (!url) {
      throw new Error("db url is required.");
    }

    redis = new Redis(url);
    connection = await amqp.connect(process.env.RABBITMQ_URL!);
    listenerChannel = await connection.createChannel();
    senderChannel = await connection.createChannel();

    // subscribers:
    new FollowshipCreatedConsumer(connection).consumeFromQueue();
  } catch (err) {
    console.error(err);
  }
};

start();

export { connection, listenerChannel, senderChannel, redis };
