import { ReplyDeletedContent } from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { connection } from "../../app";
import { Reply } from "../../models/reply";
import { ReplyDeletedConsumer } from "../reply-deleted";

it("delete reply in database when get job from reply:deleted queue", async () => {
  const newRelyId = new Types.ObjectId();
  const replyTargetTweetId = new Types.ObjectId().toHexString();
  await Reply.create({ _id: newRelyId, tweetId: replyTargetTweetId });

  const newReplyContentFromQueue: ReplyDeletedContent = {
    id: newRelyId.toHexString(),
    version: 0,
  };

  const message = {} as Message;
  await new ReplyDeletedConsumer(connection).consumeCallBack(
    newReplyContentFromQueue,
    message
  );

  const replyInDB = await Reply.findById(newRelyId);

  expect(replyInDB).toBeNull();
});
