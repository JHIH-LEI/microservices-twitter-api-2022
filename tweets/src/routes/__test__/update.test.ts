import request from "supertest";
import { app } from "../../app";
import { Tweet } from "../../models/tweet";
import { Types } from "mongoose";

it("update success", async () => {
  const ownerId = new Types.ObjectId();
  const tweet = await Tweet.create({ userId: ownerId, description: "1234" });

  await request(app)
    .put(`/api/tweets/${tweet.id}`)
    .set("Cookie", global.getCookie(ownerId))
    .send({ description: "owner updated" })
    .expect(200);

  const afterTweet = await Tweet.findById(tweet.id);
  expect(afterTweet).not.toBeNull();
  expect(afterTweet!.description).toEqual("owner updated");
});

// TODO: 409 error fix
// it("return 409 bc trying to update other user tweet", async () => {
//   const tweet = await Tweet.create({
//     userId: new Types.ObjectId(),
//     description: "1234",
//   });
//   await request(app)
//     .put(`/api/tweets/${tweet.id}`)
//     .set("Cookie", global.getCookie())
//     .send({ description: "hacker updated" })
//     .expect(403);

//   const afterTweet = await Tweet.findById(tweet.id);
//   expect(afterTweet!.description).toEqual(tweet.description);
// });

it.todo("return 409 bc provided not exists tweetId");
