import { ReplyCreatedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Reply } from "../../models/reply";
import { Tweet } from "../../models/tweet";
import { User } from "../../models/user";
import { ReplyCreatedPublisher } from "../../publishers/reply-created";

it("return 201 successful reply tweet and publish to reply:created", async () => {
  const loginUserId = new Types.ObjectId();
  const avatar = "userAvatar";
  const user = User.build({
    _id: loginUserId,
    name: "userName",
    avatar,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    account: "account",
  });
  const [tweet] = await Promise.all([
    Tweet.create({
      description: "tweet",
      userId: new Types.ObjectId(),
    }),
    user.save(),
  ]);

  await request(app)
    .post(`/api/replies/${tweet.id}`)
    .set("Cookie", global.getCookie(loginUserId))
    .send({ comment: "reply here" })
    .expect(201);

  const newReplyRecord = await Reply.findOne({
    userId: loginUserId,
    tweetId: tweet.id,
    comment: "reply here",
  });
  expect(newReplyRecord).not.toBeNull();

  expect(ReplyCreatedPublisher).toHaveBeenCalledTimes(1);
  const mockPublish = (ReplyCreatedPublisher as jest.Mock).mock.instances[0]
    .publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);
  const expectContent: ReplyCreatedContent = {
    id: newReplyRecord!.id,
    avatar,
    userId: loginUserId.toHexString(),
    version: newReplyRecord!.version,
    comment: newReplyRecord!.comment,
    tweetId: newReplyRecord!.tweetId.toHexString(),
    createdAt: newReplyRecord!.createdAt.toISOString(),
    updatedAt: newReplyRecord!.updatedAt.toISOString(),
  };
  expect(mockPublish.mock.calls[0][0]).toEqual(expectContent);
});
