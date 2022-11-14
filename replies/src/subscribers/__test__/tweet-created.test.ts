import { TweetCreatedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { connection } from "../../app";
import { TweetCreatedConsumer } from "../tweet-created";
import { Message } from "amqplib";
import { Tweet } from "../../models/tweet";

it("create new tweet when receive content from tweet:created queue", async () => {
  const tweetId = new Types.ObjectId().toHexString();
  const userId = new Types.ObjectId().toHexString();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const description = "new tweet arrived";

  const contentFromQueue: TweetCreatedContent = {
    id: tweetId,
    userId,
    createdAt,
    updatedAt,
    version: 0,
    description,
    name: "user",
    avatar: "",
  };

  const message = {} as Message;

  // @ts-ignore
  await new TweetCreatedConsumer(connection).consumeCallBack(
    contentFromQueue,
    message
  );

  const tweetInDB = await Tweet.findOne({ id: tweetId });
  expect(tweetInDB).not.toBeNull();
  expect(tweetInDB!.userId.toHexString()).toBe(userId);
});
