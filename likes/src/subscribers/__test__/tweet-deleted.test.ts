import { TweetDeletedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { TweetDeletedConsumer } from "../tweet-deleted";
import { Message } from "amqplib";
import { Tweet } from "../../models/tweet";
import { connection } from "../../app";

it("deleted tweet when receive content from tweet:deleted queue", async () => {
  const tweetId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const createdAt = new Date();
  const updatedAt = createdAt;
  const description = "new tweet arrived";

  const tweet = Tweet.build({
    _id: tweetId,
    userId,
    createdAt,
    updatedAt,
    version: 0,
    description,
  });

  await tweet.save();

  const contentFromQueue: TweetDeletedContent = {
    id: tweetId.toHexString(),
    version: 0,
  };

  const message = {} as Message;

  await new TweetDeletedConsumer(connection).consumeCallBack(
    contentFromQueue,
    message
  );

  const tweetInDB = await Tweet.findOne({ id: tweetId });
  expect(tweetInDB).toBeNull();
});

it("skip handle event because wrong tweet version", async () => {
  const tweetId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const createdAt = new Date();
  const updatedAt = createdAt;
  const description = "new tweet arrived";

  const tweet = Tweet.build({
    _id: tweetId,
    userId,
    createdAt,
    updatedAt,
    version: 0,
    description,
  });

  await tweet.save();

  const contentFromQueue: TweetDeletedContent = {
    id: tweetId.toHexString(),
    version: 10, // too new should skip. wait for other event be handle
  };

  const message = {} as Message;

  await new TweetDeletedConsumer(connection).consumeCallBack(
    contentFromQueue,
    message
  );

  const tweetInDB = await Tweet.findOne({ id: tweetId });
  expect(tweetInDB).not.toBeNull();
});
