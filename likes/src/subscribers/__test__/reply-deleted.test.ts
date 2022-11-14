import { connection } from "../../app";
import { ReplyDeletedConsumer } from "../reply-deleted";
import { Message } from "amqplib";
import { ReplyDeletedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { Reply } from "../../models/reply";

it("delete reply successfully", async () => {
  const id = new Types.ObjectId();
  const reply = Reply.build({
    _id: id,
    tweetId: new Types.ObjectId(),
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await reply.save();

  const message = {} as Message;
  const content: ReplyDeletedContent = {
    id: id.toHexString(),
    version: 0,
  };
  await new ReplyDeletedConsumer(connection).consumeCallBack(content, message);

  const afterReplyInDB = await Reply.findById(id);
  expect(afterReplyInDB).toBeNull();
});

it("do not delete reply should wait for other version first", async () => {
  const id = new Types.ObjectId();
  const createdAt = new Date();
  const reply = Reply.build({
    _id: id,
    tweetId: new Types.ObjectId(),
    version: 0,
    createdAt,
    updatedAt: createdAt,
  });
  await reply.save();

  const message = {} as Message;
  const content: ReplyDeletedContent = {
    id: id.toHexString(),
    version: 10, // too new can not be deleted should wait for other version to be done
  };
  await new ReplyDeletedConsumer(connection).consumeCallBack(content, message);
  const afterReplyInDB = await Reply.findById(id);
  expect(afterReplyInDB).not.toBeNull();
  expect(afterReplyInDB!._id).toEqual(id);
  expect(afterReplyInDB!.version).toBe(0);
  expect(afterReplyInDB!.createdAt).toEqual(createdAt);
  expect(afterReplyInDB!.updatedAt).toEqual(createdAt);
});
