import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Reply } from "../../models/reply";

it("return 204 successful delete reply", async () => {
  const tweetId = new Types.ObjectId();
  const replyUserId = new Types.ObjectId();

  // create reply
  const newReplyRes = await request(app)
    .post(`/api/replies/${tweetId}`)
    .set("Cookie", global.getCookie(replyUserId))
    .send({ comment: "reply" })
    .expect(201);

  await request(app)
    .delete(`/api/replies/${newReplyRes.body.id}`)
    .set("Cookie", global.getCookie(replyUserId))
    .expect(204);

  const newReplyRecord = await Reply.findById(newReplyRes.body.id);
  expect(newReplyRecord).toBeNull();
});
