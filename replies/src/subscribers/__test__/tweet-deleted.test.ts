import { TweetDeletedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { TweetDeletedConsumer } from "../tweet-deleted";
import { Message } from "amqplib";
import { Tweet } from "../../models/tweet";
import { connection } from "../../app";

it("deleted tweet when receive content from tweet:deleted queue", async () => {
  const tweetId = new Types.ObjectId();
  const userId = new Types.ObjectId();

  const tweet = Tweet.build({
    _id: tweetId,
    userId,
  });

  await tweet.save();

  const contentFromQueue: TweetDeletedContent = {
    id: tweetId.toHexString(),
    version: 0,
  };

  const message = {} as Message;

  // @ts-ignore
  await new TweetDeletedConsumer(connection).consumeCallBack(
    contentFromQueue,
    message
  );

  const tweetInDB = await Tweet.findOne({ id: tweetId });
  expect(tweetInDB).toBeNull();
});

it("skip handle event because tweet have not exist. should wait for create first", async () => {
  const tweetId = new Types.ObjectId();

  const contentFromQueue: TweetDeletedContent = {
    id: tweetId.toHexString(),
    version: 0,
  };

  const message = {} as Message;

  // @ts-ignore
  await new TweetDeletedConsumer(connection).consumeCallBack(
    contentFromQueue,
    message
  );
  // 不要收到任何跳錯訊息就代表通過了
});
