import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Like } from "../../models/like";
import { Tweet } from "../../models/tweet";

it("return 201 successful like tweet", async () => {
  const tweet = await Tweet.create({
    description: "tweet",
    userId: new Types.ObjectId(),
  });
  const loginUserId = new Types.ObjectId();
  await request(app)
    .post(`/api/likes/${tweet.id}`)
    .set("Cookie", global.getCookie(loginUserId))
    .expect(201);

  const newLikeRecord = await Like.findOne({
    userId: loginUserId,
    tweetId: tweet.id,
  });
  expect(newLikeRecord).not.toBeNull();
});
