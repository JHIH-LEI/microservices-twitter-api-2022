import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Reply } from "../../models/reply";
import { Tweet } from "../../models/tweet";

it("return 201 successful reply tweet", async () => {
  const tweet = await Tweet.create({
    description: "tweet",
    userId: new Types.ObjectId(),
  });
  const loginUserId = new Types.ObjectId();

  await request(app)
    .post(`/api/replies/${tweet.id}`)
    .set("Cookie", global.getCookie(loginUserId))
    .send({ comment: "reply here" })
    .expect(201);

  const newLikeRecord = await Reply.findOne({
    userId: loginUserId,
    tweetId: tweet.id,
    comment: "reply here",
  });
  expect(newLikeRecord).not.toBeNull();
});
