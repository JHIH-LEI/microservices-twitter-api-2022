import dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import amqp from "amqplib";
import Redis from "ioredis";
import { FollowshipCreatedConsumer } from "./subscribers/followship-created";

export const redis = new Redis();
export let connection: amqp.Connection;
export let listenerChannel: amqp.Channel;
export let senderChannel: amqp.Channel;
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
  } catch (err) {
    console.error(err);
  }
};

start();
