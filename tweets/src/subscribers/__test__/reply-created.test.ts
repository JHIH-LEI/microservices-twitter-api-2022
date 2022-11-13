import { ReplyCreatedContent } from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { connection } from "../../app";
import { Reply } from "../../models/reply";
import { ReplyCreatedConsumer } from "../reply-created";

it("create reply in database when get job from reply:created queue", async () => {
  const newRelyId = new Types.ObjectId().toHexString();
  const replyTargetTweetId = new Types.ObjectId().toHexString();
  const newReplyContentFromQueue: ReplyCreatedContent = {
    id: newRelyId,
    version: 0,
    comment: "",
    avatar: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "",
    tweetId: replyTargetTweetId,
  };

  const message = {} as Message;
  await new ReplyCreatedConsumer(connection).consumeCallBack(
    newReplyContentFromQueue,
    message
  );

  const replyInDB = await Reply.findById(newRelyId);

  expect(replyInDB).not.toBeNull();
  expect(replyInDB!.id).toEqual(newRelyId);
});
