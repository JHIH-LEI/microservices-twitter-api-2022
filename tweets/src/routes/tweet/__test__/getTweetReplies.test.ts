import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../../app";
import { Reply } from "../../../models/reply";
import { User } from "../../../models/user";

it("return all replies by tweet1Id", async () => {
  // 新增要發表留言的兩位使用者
  const [targetUser, replyUser2] = await Promise.all([
    User.create({ name: "targetUser", avatar: "u", account: "targetUser" }),
    User.create({ name: "replyUser2", avatar: "u", account: "replyUser2" }),
  ]);

  const targetUserId = targetUser!.id;
  const reply2UserId = replyUser2!.id;

  // 建立推文1的留言：
  // targetUser留言了兩次,另個使用者留言一次
  const tweet1Id = new Types.ObjectId();

  const reply1 = await Reply.create({
    comment: "reply1",
    userId: targetUserId,
    tweetId: tweet1Id,
  });

  const reply2 = await Reply.create({
    comment: "reply2",
    userId: reply2UserId,
    tweetId: tweet1Id,
  });

  const reply3 = await Reply.create({
    comment: "reply3",
    userId: targetUserId,
    tweetId: tweet1Id,
  });

  const res = await request(app)
    .get(`/api/tweets/${tweet1Id}/replies`)
    .set("Cookie", global.getCookie(new Types.ObjectId(reply2UserId)))
    .expect(200);

  const expectReplyOne = {
    id: reply1.id,
    comment: reply1.comment,
    createdAt: reply1.createdAt.toISOString(),
    updatedAt: reply1.updatedAt.toISOString(),
    user: {
      id: targetUserId,
      name: targetUser.name,
      account: targetUser.account,
      avatar: targetUser.avatar,
    },
  };
  const expectReplyThree = {
    id: reply3.id,
    comment: reply3.comment,
    createdAt: reply3.createdAt.toISOString(),
    updatedAt: reply3.updatedAt.toISOString(),
    user: {
      id: targetUserId,
      name: targetUser.name,
      account: targetUser.account,
      avatar: targetUser.avatar,
    },
  };

  const expectReplyTwo = {
    id: reply2.id,
    comment: reply2.comment,
    createdAt: reply2.createdAt.toISOString(),
    updatedAt: reply2.updatedAt.toISOString(),
    user: {
      id: reply2UserId,
      name: replyUser2.name,
      account: replyUser2.account,
      avatar: replyUser2.avatar,
    },
  };

  expect(res.body.length).toBe(3);
  expect(res.body[0]).toEqual(expectReplyOne);
  expect(res.body[1]).toEqual(expectReplyTwo);
  expect(res.body[2]).toEqual(expectReplyThree);
});
