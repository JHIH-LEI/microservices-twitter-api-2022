import { TweetUpdatedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { connection } from "../../app";
import { Tweet } from "../../models/tweet";
import { TweetUpdatedConsumer } from "../tweet-updated";
import { Message } from "amqplib";

it("successfully update tweet", async () => {
  const tweetId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const oldDescription = "old";
  const createdAt = new Date();

  const tweet = Tweet.build({
    _id: tweetId,
    userId,
    description: oldDescription,
    createdAt,
    version: 0,
    updatedAt: createdAt,
  });

  await tweet.save();

  const updatedAt = new Date();
  const updatedDescription = "update";
  const updatedContent: TweetUpdatedContent = {
    id: tweetId.toHexString(),
    description: updatedDescription,
    updatedAt: updatedAt.toISOString(),
    version: 1,
  };

  const message = {} as Message;
  await new TweetUpdatedConsumer(connection).consumeCallBack(
    updatedContent,
    message
  );

  const afterUpdatedTweetInDB = await Tweet.findById(tweetId);

  expect(afterUpdatedTweetInDB!.description).toBe(updatedDescription);
  expect(afterUpdatedTweetInDB!.updatedAt).toEqual(updatedAt);
  expect(afterUpdatedTweetInDB!.version).toBe(1);
});

it("do not update tweet because incoming version too new", async () => {
  const tweetId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const oldDescription = "old";
  const createdAt = new Date();

  const tweet = Tweet.build({
    _id: tweetId,
    userId,
    description: oldDescription,
    createdAt,
    version: 0,
    updatedAt: createdAt,
  });

  await tweet.save();

  const updatedAt = new Date();
  const updatedDescription = "update";
  const updatedContent: TweetUpdatedContent = {
    id: tweetId.toHexString(),
    description: updatedDescription,
    updatedAt: updatedAt.toISOString(),
    version: 10,
  };

  const message = {} as Message;
  await new TweetUpdatedConsumer(connection).consumeCallBack(
    updatedContent,
    message
  );

  const afterUpdatedTweetInDB = await Tweet.findById(tweetId);

  expect(afterUpdatedTweetInDB!.description).toBe(oldDescription);
  expect(afterUpdatedTweetInDB!.updatedAt).toEqual(createdAt);
  expect(afterUpdatedTweetInDB!.version).toBe(0);
});
