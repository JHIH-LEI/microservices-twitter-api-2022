import { TweetDeletedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { TweetDeletedConsumer } from "../tweet-deleted";
import { Message } from "amqplib";
import { Tweet } from "../../models/tweet";
import { connection } from "../../app";
import { LikeDeletedPublishers } from "../../publishers/like-deleted";
import { Like } from "../../models/like";

it("deleted tweet and related likes and publish to like:deleted", async () => {
  // received delete tweet -> delete tweet -> hook delete related like -> hook LikeDeletedPublisher publish
  const tweetId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const createdAt = new Date();
  const updatedAt = createdAt;
  const description = "new tweet arrived";
  const userTwoId = new Types.ObjectId();

  const tweet = Tweet.build({
    _id: tweetId,
    userId,
    createdAt,
    updatedAt,
    version: 0,
    description,
  });

  // setup like record it should be delete after and trigger LikeDeletedPublisher to publish
  const tweetLikeOne = Like.build({ tweetId, userId });
  const tweetLikeTwo = Like.build({ tweetId, userId: userTwoId });

  await tweet.save();
  await Promise.all([tweetLikeOne.save(), tweetLikeTwo.save()]);

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
  const relatedLikeRecord = await Like.find({ tweetId });
  expect(relatedLikeRecord.length).toBe(0);
  expect(LikeDeletedPublishers).toBeCalledTimes(1);
  // note: 可以去看like pre deleteMany , 不管要publish幾個，都只會用同一個publisher
  const mockPublish = (LikeDeletedPublishers as jest.Mock).mock.instances[0]
    .publish as jest.Mock;
  expect(mockPublish).toBeCalledTimes(2);
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
