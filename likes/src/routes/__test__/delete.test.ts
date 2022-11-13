import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Like } from "../../models/like";
import { Tweet } from "../../models/tweet";
import { LikeDeletedPublishers } from "../../publishers/like-deleted";

it("return 204 successful unlike tweet and publish content to like:deleted queue", async () => {
  const tweet = await Tweet.create({
    description: "tweet",
    userId: new Types.ObjectId(),
  });
  const loginUserId = new Types.ObjectId();

  const newLikeRecord = await Like.create({
    tweetId: tweet.id,
    userId: loginUserId,
  });

  await request(app)
    .delete(`/api/likes/${tweet.id}`)
    .set("Cookie", global.getCookie(loginUserId))
    .expect(204);

  const afterCallDeleteLikeRecord = await Like.findOne({
    userId: loginUserId,
    tweetId: tweet.id,
  });

  expect(afterCallDeleteLikeRecord).toBeNull();

  // publish
  expect(LikeDeletedPublishers).toHaveBeenCalledTimes(1);
  const mockLikeDeletedPublishers = (LikeDeletedPublishers as jest.Mock).mock
    .instances[0];
  const mockPublish = mockLikeDeletedPublishers.publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);
  expect(mockPublish.mock.calls[0][0]).toEqual({ id: newLikeRecord!.id });
});
