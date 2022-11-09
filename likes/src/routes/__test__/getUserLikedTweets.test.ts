import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Like } from "../../models/like";
import { Reply } from "../../models/reply";
import { Tweet } from "../../models/tweet";
import { User } from "../../models/user";

it("return all tweets liked by target user", async () => {
  // 總共有3個按讚資料，有2個是target user按過讚的紀錄

  // 新增登入的使用者跟target user
  const [targetUser, loginUser] = await Promise.all([
    User.create({ name: "targetUser", avatar: "u", account: "targetUser" }),
    User.create({ name: "loginUser", avatar: "u", account: "loginUser" }),
  ]);

  const targetUserId = targetUser!.id;
  const loginUserId = loginUser!.id;

  // 新增要被按讚的三則貼文

  const [tweet1, tweet2, tweet3] = await Promise.all([
    Tweet.create({ description: "tweet1" }),
    Tweet.create({ description: "tweet2" }),
    Tweet.create({ description: "tweet3" }),
  ]);

  const tweet1Id = tweet1.id;
  const tweet2Id = tweet2.id;
  const tweet3Id = tweet3.id;

  // target user 按兩則貼文讚，登入使用者也按過其中一則貼文讚
  // 讓每則貼文都有2筆留言紀錄
  await Promise.all([
    Like.create({ userId: targetUserId, tweetId: tweet1Id }),
    Like.create({ userId: loginUserId, tweetId: tweet1Id }),
    Like.create({ userId: targetUserId, tweetId: tweet2Id }),
    Reply.create({ tweetId: tweet1Id }),
    Reply.create({ tweetId: tweet1Id }),
    Reply.create({ tweetId: tweet2Id }),
    Reply.create({ tweetId: tweet2Id }),
    Reply.create({ tweetId: tweet3Id }),
    Reply.create({ tweetId: tweet3Id }),
  ]);

  await Tweet.create();

  const res = await request(app)
    .get(`/api/likes/${targetUserId}`)
    .set("Cookie", global.getCookie(new Types.ObjectId(loginUserId)))
    .expect(200);

  const expectTweetOne = {
    tweet: {
      id: tweet1Id,
      description: tweet1.description,
      createdAt: tweet1.createdAt.toISOString(),
      updatedAt: tweet1.updatedAt.toISOString(),
      totalLikes: 2,
      totalReplies: 2,
      isLiked: 1,
    },
  };

  const expectTweetTwo = {
    tweet: {
      id: tweet2Id,
      description: tweet2.description,
      createdAt: tweet2.createdAt.toISOString(),
      updatedAt: tweet2.updatedAt.toISOString(),
      totalLikes: 1,
      totalReplies: 2,
      isLiked: 0,
    },
  };
  expect(res.body[0]).toEqual(expectTweetOne);
  expect(res.body[1]).toEqual(expectTweetTwo);
});
