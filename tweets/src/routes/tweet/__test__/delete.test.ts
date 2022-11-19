import request from "supertest";
import { app } from "../../../app";
import { Types } from "mongoose";
import { Tweet } from "../../../models/tweet";
import { User } from "../../../models/user";
import { TweetDeletedPublisher } from "../../../publishers/tweet-deleted";

it("return 204 by delete success and publish to tweet:deleted queue with valid content", async () => {
  const ownerUser = await User.create({
    name: "owner",
    avatar: "ss",
    account: "owner1111",
  });

  const ownerUserId = new Types.ObjectId(ownerUser.id);
  const res = await request(app)
    .post("/api/tweets")
    .set("Cookie", global.getCookie(ownerUserId))
    .send({
      description: "new",
    })
    .expect(201);

  const newTweetId = res.body;

  await request(app)
    .delete(`/api/tweets/${newTweetId}`)
    .set("Cookie", global.getCookie(ownerUserId))
    .expect(204);

  const deleteResult = await Tweet.findById(newTweetId);
  expect(deleteResult).toBeNull();

  // publish

  expect(TweetDeletedPublisher).toHaveBeenCalledTimes(1);
  const mockTweetDeletedPublisherInstance = (TweetDeletedPublisher as jest.Mock)
    .mock.instances[0];
  const mockPublish = mockTweetDeletedPublisherInstance.publish as jest.Mock;

  expect(mockPublish).toHaveBeenCalledTimes(1);
  expect(mockPublish).toHaveBeenCalledWith({ id: newTweetId, version: 0 });
});

// TODO: fix conflict error now it did not catch as custom error
// it("return 409 by provide not exists tweetId", async () => {
//   const ownerUser = await User.create({
//     name: "owner",
//     avatar: "ss",
//     account: "owner1111",
//   });

//   const ownerUserId = new Types.ObjectId(ownerUser.id);
//   await request(app)
//     .post("/api/tweets")
//     .set("Cookie", global.getCookie(ownerUserId))
//     .send({
//       description: "new",
//     })
//     .expect(201);

//   await request(app)
//     .delete(`/api/tweets/${new Types.ObjectId()}`)
//     .set("Cookie", global.getCookie(ownerUserId))
//     .expect(409);
// });

// it("return 409 by trying to delete other user tweet so it can not be query", async () => {
//   const ownerUser = await User.create({
//     name: "owner",
//     avatar: "ss",
//     account: "owner1111",
//   });

//   const ownerUserId = new Types.ObjectId(ownerUser.id);
//   const res = await request(app)
//     .post("/api/tweets")
//     .set("Cookie", global.getCookie(ownerUserId))
//     .send({
//       description: "new",
//     })
//     .expect(201);

//   const newTweetId = res.body;

//   await request(app)
//     .delete(`/api/tweets/${newTweetId}`)
//     .set("Cookie", global.getCookie())
//     .expect(409);
// });
