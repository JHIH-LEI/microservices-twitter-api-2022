import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../../app";
import { Reply } from "../../../models/reply";
import { ReplyDeletedPublisher } from "../../../publishers/reply-deleted";

it("return 204 successful delete reply and publish to reply:deleted queue", async () => {
  const tweetId = new Types.ObjectId();
  const replyUserId = new Types.ObjectId();

  // create reply
  const newReply = Reply.build({
    tweetId: tweetId.toHexString(),
    userId: replyUserId.toHexString(),
    comment: "reply",
  });
  await newReply.save();

  await request(app)
    .delete(`/api/replies/${newReply.id}`)
    .set("Cookie", global.getCookie(replyUserId))
    .expect(204);

  const afterCallDeleteReplyRecord = await Reply.findById(newReply.id);
  expect(afterCallDeleteReplyRecord).toBeNull();

  // publish

  expect(ReplyDeletedPublisher).toHaveBeenCalledTimes(1);
  const mockPublish = (ReplyDeletedPublisher as jest.Mock).mock.instances[0]
    .publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);
  expect(mockPublish).toHaveBeenCalledWith({
    id: newReply!.id,
    version: newReply!.version,
  });
});
