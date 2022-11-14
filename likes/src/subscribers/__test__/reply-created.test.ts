import { connection } from "../../app";
import { ReplyCreatedConsumer } from "../reply-created";
import { Message } from "amqplib";
import { ReplyCreatedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { Reply } from "../../models/reply";

it("create reply successfully", async () => {
  const message = {} as Message;
  const id = new Types.ObjectId();
  const tweetId = new Types.ObjectId();
  const createdAt = new Date();
  const content: ReplyCreatedContent = {
    id: id.toHexString(),
    tweetId: tweetId.toHexString(),
    comment: "reply",
    version: 0,
    userId: new Types.ObjectId().toHexString(),
    avatar: "",
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };
  await new ReplyCreatedConsumer(connection).consumeCallBack(content, message);

  const replyInDB = await Reply.findById(id);
  expect(replyInDB).not.toBeNull();
  expect(replyInDB!.tweetId).toEqual(tweetId);
  expect(replyInDB!.createdAt).toEqual(createdAt);
  expect(replyInDB!.updatedAt).toEqual(createdAt);
  expect(replyInDB!.version).toEqual(0);
});
