import request from "supertest";
import { app } from "../../app";
import { Types } from "mongoose";
import { Tweet } from "../../models/tweet";
import { Like } from "../../models/like";
import { Reply } from "../../models/reply";
import { User } from "../../models/user";

it("return all tweets and show correct data", async () => {
  // 新增兩則推文，第一則有2個讚2個留言，第二則有1個讚0個留言。
  // 登入的使用者有按第一則推文讚
  const loginUserId = new Types.ObjectId();

  // create two user who own tweet
  const [tweetOneCreator, tweetTwoCreator] = await Promise.all([
    User.create({
      name: "I am tweetOne owner",
      account: "tweetOneIsMy",
      avatar: "sss",
      version: 0,
    }),
    await User.create({
      name: "I am tweetTwo owner",
      account: "tweetTwoIsMy",
      avatar: "sss",
      version: 0,
    }),
  ]);

  // create two tweet
  const [tweetOne, tweetTwo] = await Promise.all([
    Tweet.create({
      description: "tweetOne",
      userId: tweetOneCreator.id,
    }),
    Tweet.create({
      description: "tweetTwo",
      userId: tweetTwoCreator.id,
    }),
  ]);

  // Like tweetOne by 2 user & Like tweetTwo by 1 user
  // Reply tweetOne twice
  await Promise.all([
    Like.create({ userId: loginUserId, tweetId: tweetOne.id }),
    ,
    Like.create({ userId: new Types.ObjectId(), tweetId: tweetOne.id }),
    Like.create({ userId: new Types.ObjectId(), tweetId: tweetTwo.id }),
    Reply.create({ userId: new Types.ObjectId(), tweetId: tweetOne.id }),
    Reply.create({ userId: new Types.ObjectId(), tweetId: tweetOne.id }),
  ]);

  const res = await request(app)
    .get("/api/tweets")
    .set("Cookie", global.getCookie(loginUserId))
    .expect(200);

  const expectFirstTweet = {
    id: tweetOne.id,
    description: tweetOne.description,
    createdAt: tweetOne.createdAt.toISOString(),
    updatedAt: tweetOne.updatedAt.toISOString(),
    user: {
      id: tweetOneCreator.id,
      avatar: tweetOneCreator.avatar,
      account: tweetOneCreator.account,
      name: tweetOneCreator.name,
    },
    isLiked: 1,
    totalLikes: 2,
    totalReplies: 2,
  };

  const expectSecondTweet = {
    id: tweetTwo.id,
    description: tweetTwo.description,
    createdAt: tweetTwo.createdAt.toISOString(),
    updatedAt: tweetTwo.updatedAt.toISOString(),
    user: {
      id: tweetTwoCreator.id,
      avatar: tweetTwoCreator.avatar,
      account: tweetTwoCreator.account,
      name: tweetTwoCreator.name,
    },
    isLiked: 0,
    totalLikes: 1,
    totalReplies: 0,
  };

  expect(res.body.length).toBe(2);
  expect(res.body[0]).toEqual(expectFirstTweet);
  expect(res.body[1]).toEqual(expectSecondTweet);
});
