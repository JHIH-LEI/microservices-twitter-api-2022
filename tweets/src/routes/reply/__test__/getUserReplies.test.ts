import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../../app";
import { Reply } from "../../../models/reply";
import { Tweet } from "../../../models/tweet";
import { User } from "../../../models/user";

it("return all replies by targetUserId", async () => {
  // 返回target user留言過的資料，應返回3個資料。

  // 新增要發表留言的兩位使用者 & 兩則推文的作者
  const [targetUser, replyUser2, tweet1Owner, tweet2Owner] = await Promise.all([
    User.create({ name: "targetUser", avatar: "u", account: "targetUser" }),
    User.create({ name: "replyUser2", avatar: "u", account: "replyUser2" }),
    User.create({ name: "tweet1Owner", avatar: "u", account: "tweet1Owner" }),
    User.create({ name: "tweet2Owner", avatar: "u", account: "tweet2Owner" }),
  ]);

  const targetUserId = targetUser!.id;
  const reply2UserId = replyUser2!.id;
  console.log(
    "targetUser for test getUserReplies",
    targetUser,
    "targetUserId",
    targetUserId
  );
  // 新增兩則推文,有三則留言會在貼文1，其中兩個留言是targetUser留的
  // tweet2 有一則留言，是targetUser留的

  const [tweet1, tweet2] = await Promise.all([
    Tweet.create({
      userId: tweet1Owner.id,
      description: "new Tweet from tweet1Owner",
    }),
    Tweet.create({
      userId: tweet2Owner.id,
      description: "new Tweet from tweet2Owner",
    }),
  ]);

  // 新增三則留言在第一個貼文, targetUser留言了兩次
  const tweet1Id = tweet1.id;
  // 第二則貼文被targetUser留言一次
  const tweet2Id = tweet2.id;

  const reply1 = await Reply.create({
    comment: "reply1",
    userId: targetUserId,
    tweetId: tweet1Id,
  });

  await Reply.create({
    comment: "reply2",
    userId: reply2UserId,
    tweetId: tweet1Id,
  });

  const reply3 = await Reply.create({
    comment: "reply3",
    userId: targetUserId,
    tweetId: tweet1Id,
  });

  const reply4 = await Reply.create({
    comment: "reply4",
    userId: targetUserId,
    tweetId: tweet2Id,
  });

  const res = await request(app)
    .get(`/api/replies/users/${targetUserId}`)
    .set("Cookie", global.getCookie(new Types.ObjectId(reply2UserId)))
    .expect(200);

  const expectReplyOne = {
    comment: reply4.comment,
    createdAt: reply4.createdAt.toISOString(),
    updatedAt: reply4.updatedAt.toISOString(),
    tweet: {
      id: tweet2Id,
      user: {
        id: tweet2Owner.id,
        account: tweet2Owner.account,
      },
    },
  };

  const expectReplyTwo = {
    comment: reply3.comment,
    createdAt: reply3.createdAt.toISOString(),
    updatedAt: reply3.updatedAt.toISOString(),
    tweet: {
      id: tweet1Id,
      user: {
        id: tweet1Owner.id,
        account: tweet1Owner.account,
      },
    },
  };

  const expectReplyThree = {
    comment: reply1.comment,
    createdAt: reply1.createdAt.toISOString(),
    updatedAt: reply1.updatedAt.toISOString(),
    tweet: {
      id: tweet1Id,
      user: {
        id: tweet1Owner.id,
        account: tweet1Owner.account,
      },
    },
  };

  expect(res.body.length).toBe(3);
  expect(res.body[0]).toEqual(expectReplyOne);
  expect(res.body[1]).toEqual(expectReplyTwo);
  expect(res.body[2]).toEqual(expectReplyThree);
});
