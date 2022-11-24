import request from "supertest";
import { app } from "../../../app";
import { Like } from "../../../models/like";
import { Tweet } from "../../../models/tweet";
import { User } from "../../../models/user";
import { Types } from "mongoose";

it("get tweet detail by tweet id", async () => {
  const creator = await User.create({
    name: "user",
    account: "1234556",
    avatar: "sss",
    version: 0,
  });

  const liker = await User.create({
    name: "liker",
    account: "abcdef",
    avatar: "sss",
    version: 0,
  });

  const tweet = await Tweet.create({
    description: "show me",
    userId: creator.id,
  });

  await Like.create({ userId: liker.id, tweetId: tweet.id });

  const res = await request(app)
    .get(`/api/tweets/${tweet.id}`)
    .set("Cookie", global.getCookie(new Types.ObjectId(liker.id)))
    .expect(200);

  const expectTweet = {
    id: tweet.id,
    description: tweet.description,
    createdAt: tweet.createdAt.toISOString(),
    updatedAt: tweet.updatedAt.toISOString(),
    user: {
      id: creator.id,
      avatar: creator.avatar,
      account: creator.account,
      name: creator.name,
    },
    isLiked: 1,
    totalReplies: 0,
    totalLikes: 1,
  };

  expect(res.body).toEqual(expectTweet);
});

it("get 400 by provide not objectId string format tweetId", async () => {
  return request(app)
    .get("/api/tweets/A")
    .set("Cookie", global.getCookie())
    .expect(400);
});

// TODO:不知道為啥error直接throw出去了並沒有被errorHandler middleware接到
// it("get 409 by provide not exist tweetId (can not find tweet)", async () => {
//   const validObjectIdFormat = new Types.ObjectId();
//   await request(app)
//     .get(`/api/tweets/${validObjectIdFormat}`)
//     .set("Cookie", global.getCookie())
//     .expect(409);
// });
