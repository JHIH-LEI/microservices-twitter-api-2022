import { TweetDeletedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { TweetDeletedConsumer } from "../tweet-deleted";
import { Message } from "amqplib";
import { Tweet } from "../../models/tweet";
import { connection } from "../../app";
import { Reply } from "../../models/reply";
import { ReplyDeletedPublisher } from "../../publishers/reply-deleted";

it("deleted tweet and all related replies and then publish to reply:deleted", async () => {
  const tweetId = new Types.ObjectId();
  const userId = new Types.ObjectId();

  const tweet = Tweet.build({
    _id: tweetId,
    userId,
  });

  await tweet.save();

  const replyOne = Reply.build({
    comment: "replyOne",
    userId: new Types.ObjectId().toHexString(),
    tweetId: tweetId.toHexString(),
  });

  const replyTwo = Reply.build({
    comment: "replyreplyTwo",
    userId: new Types.ObjectId().toHexString(),
    tweetId: tweetId.toHexString(),
  });

  await Promise.all([replyOne.save(), replyTwo.save()]);

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

  const replatedReply = await Reply.find({ tweetId });
  expect(replatedReply.length).toBe(0);
  expect(ReplyDeletedPublisher).toBeCalledTimes(1);
  const mockPublish = (ReplyDeletedPublisher as jest.Mock).mock.instances[0]
    .publish as jest.Mock;
  expect(mockPublish).toBeCalledTimes(2);
});

it("skip handle event because tweet have not exist. should wait for create first", async () => {
  const tweetId = new Types.ObjectId();

  const contentFromQueue: TweetDeletedContent = {
    id: tweetId.toHexString(),
    version: 0,
  };

  const message = {} as Message;

  await new TweetDeletedConsumer(connection).consumeCallBack(
    contentFromQueue,
    message
  );
  // 不要收到任何跳錯訊息就代表通過了
});
