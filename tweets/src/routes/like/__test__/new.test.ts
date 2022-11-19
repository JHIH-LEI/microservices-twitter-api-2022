import { LikeCreatedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../../app";
import { Like } from "../../../models/like";
import { Tweet } from "../../../models/tweet";
import { User } from "../../../models/user";
import { LikeCreatedPublishers } from "../../../publishers/like-created";

it("return 201 successful like tweet and send like content to like:created queue with valid data", async () => {
  // setup
  const tweet = await Tweet.create({
    description: "tweet",
    userId: new Types.ObjectId(),
  });

  const likeOwnerId = new Types.ObjectId();
  const likeOwnerName = "likeOwnerName";
  const likeOwnerAvatar = "likeOwnerAvatar";
  const likeOwnerAccount = "likeOwnerAccount";
  const likeOwner = User.build({
    _id: likeOwnerId,
    name: likeOwnerName,
    account: likeOwnerAccount,
    avatar: likeOwnerAvatar,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
  });
  await likeOwner.save();

  // test
  await request(app)
    .post(`/api/likes/${tweet.id}`)
    .set("Cookie", global.getCookie(likeOwnerId))
    .expect(201);

  const newLikeRecord = await Like.findOne({
    userId: likeOwnerId,
    tweetId: tweet.id,
  });

  expect(newLikeRecord).not.toBeNull();

  // publish
  expect(LikeCreatedPublishers).toBeCalledTimes(1);
  const mockLikeCreatedPublishersInstance = (LikeCreatedPublishers as jest.Mock)
    .mock.instances[0];
  const mockPublish = mockLikeCreatedPublishersInstance.publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);

  // validate publish content
  const expectPublishContent: LikeCreatedContent = {
    id: newLikeRecord!.id.toString(),
    userId: likeOwnerId.toString(),
    tweetId: tweet.id,
    name: likeOwnerName,
    avatar: likeOwnerAvatar,
    createdAt: newLikeRecord!.createdAt.toISOString(),
  };

  expect(mockPublish.mock.calls[0][0]).toEqual(expectPublishContent);
});

it("can not multiple like by same user", async () => {
  // setup
  const tweet = await Tweet.create({
    description: "tweet",
    userId: new Types.ObjectId(),
  });

  const likeOwnerId = new Types.ObjectId();
  const likeOwnerName = "likeOwnerName";
  const likeOwnerAvatar = "likeOwnerAvatar";
  const likeOwnerAccount = "likeOwnerAccount";
  const likeOwner = User.build({
    _id: likeOwnerId,
    name: likeOwnerName,
    account: likeOwnerAccount,
    avatar: likeOwnerAvatar,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
  });
  await likeOwner.save();

  // test
  await request(app)
    .post(`/api/likes/${tweet.id}`)
    .set("Cookie", global.getCookie(likeOwnerId))
    .expect(201);

  await request(app)
    .post(`/api/likes/${tweet.id}`)
    .set("Cookie", global.getCookie(likeOwnerId))
    .expect(409);

  const likeResult = await Like.find({
    tweetId: tweet.id,
  });

  expect(likeResult.length).toBe(1);
});
