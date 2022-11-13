import request from "supertest";
import { app } from "../../app";
import { Tweet } from "../../models/tweet";
import { Types } from "mongoose";
import { TweetUpdatedPublisher } from "../../publishers/tweet-updated";
import { TweetUpdatedContent } from "@domosideproject/twitter-common";

it("update success and publish to tweet:updated with valid content", async () => {
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

  // publish

  expect(TweetUpdatedPublisher).toHaveBeenCalledTimes(1);
  const mockTweetUpdatedPublisherInstance = (TweetUpdatedPublisher as jest.Mock)
    .mock.instances[0];
  const mockPublish = mockTweetUpdatedPublisherInstance.publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);

  const expectTweetUpdatedPublishContent: TweetUpdatedContent = {
    id: tweet.id,
    userId: ownerId.toHexString(),
    updatedAt: tweet.updatedAt.toISOString(),
    description: tweet.description,
    version: tweet.version,
  };

  expect(mockPublish.mock.calls[0][0]).toEqual(
    expectTweetUpdatedPublishContent
  );
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
