import amqp from "amqplib";
import Redis from "ioredis";

// TODO: db url
export const redis = new Redis();
export let connection: amqp.Connection;
export let listenerChannel: amqp.Channel;
export let senderChannel: amqp.Channel;
const start = async () => {
  try {
    connection = await amqp.connect("amqp://localhost:5672");
    listenerChannel = await connection.createChannel();
    senderChannel = await connection.createChannel();
  } catch (err) {
    console.error(err);
  }
};

start();
