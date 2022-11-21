import request from "supertest";
import { app } from "../../../app";
import { Tweet } from "../../../models/tweet";
import { User } from "../../../models/user";
import { Types } from "mongoose";
import { TweetCreatedPublisher } from "../../../publishers/tweet-created";
import { TweetCreatedContent } from "@domosideproject/twitter-common";

it("return 400 because description over 140 words", async () => {
  const loginUser = await User.create({
    name: "test",
    avatar: "sss",
    account: "1234",
  });

  const description = "new".repeat(140);
  await request(app)
    .post("/api/tweets")
    .set("Cookie", global.getCookie(new Types.ObjectId(loginUser.id)))
    .send({
      description,
    })
    .expect(400);
});

it("return 201 by provide valid input and it have publish new tweet content to tweet:created queue", async () => {
  const loginUser = await User.create({
    name: "test",
    avatar: "ss",
    account: "1234",
  });
  const description = `new! ${new Date()}`;
  const res = await request(app)
    .post("/api/tweets")
    .set("Cookie", global.getCookie(new Types.ObjectId(loginUser.id)))
    .send({
      description,
    })
    .expect(201);

  const newTweet = await Tweet.findOne({ description });
  expect(newTweet).not.toBeNull();
  expect(res.body).toEqual(newTweet!.id);

  // publish
  expect(TweetCreatedPublisher).toBeCalledTimes(1);
  const mockTweetCreatedPublisherInstance = (TweetCreatedPublisher as jest.Mock)
    .mock.instances[0];
  const mockPublish = mockTweetCreatedPublisherInstance.publish as jest.Mock;
  expect(mockPublish).toBeCalledTimes(1);

  // validate publish content
  const expectTweetCreatedContent: TweetCreatedContent = {
    id: newTweet!.id,
    userId: loginUser.id,
    createdAt: newTweet!.createdAt.toISOString(),
    version: newTweet!.version,
    updatedAt: newTweet!.updatedAt.toISOString(),
    description: newTweet!.description,
  };

  expect(mockPublish.mock.calls[0][0]).toEqual(expectTweetCreatedContent);
});

it("return 401 bc not login", async () => {
  return request(app)
    .post("/api/tweets")
    .send({
      description: "new!",
    })
    .expect(401);
});
