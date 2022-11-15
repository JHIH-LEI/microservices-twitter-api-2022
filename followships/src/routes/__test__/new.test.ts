import { FollowshipCreatedContent } from "@domosideproject/twitter-common";
import request from "supertest";
import { app } from "../../app";
// import { User } from "../../models/user";
import { db } from "../../models/index";
import { FollowshipCreatedPublisher } from "../../publishers/followship-created";
const { User } = db;

it("start follow and publish to followship:created", async () => {
  jest.setTimeout(10000);
  const followerName = "follower";
  const followerAccount = "12345678";
  const followerAvatar = "12345678";
  const [follower, following] = await Promise.all([
    User.create({
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: followerName,
      avatar: followerAvatar,
      account: followerAccount,
      version: 0,
    }),
    User.create({
      id: "2",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "following me",
      avatar: "",
      account: "22222222",
      version: 0,
    }),
  ]);

  await request(app)
    .post(`/api/followships/${following.id}`)
    .set("Cookie", global.getCookie(follower.id))
    .expect(201);

  const followshipInDB = await db.Followship.findOne({
    where: { followerId: follower.id, followingId: following.id },
  });
  expect(followshipInDB).not.toBeNull();
  expect(followshipInDB!.followerId).toBe(follower.id);
  expect(followshipInDB!.followingId).toBe(following.id);

  // test publisher
  expect(FollowshipCreatedPublisher).toHaveBeenCalledTimes(1);
  const mockPublish = (FollowshipCreatedPublisher as jest.Mock).mock
    .instances[0].publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);
  const followshipCreatedContent: FollowshipCreatedContent = {
    followerId: follower.id,
    followingId: following.id,
    createdAt: followshipInDB!.createdAt.toISOString(),
    name: followerName,
    avatar: followerAvatar,
  };
  expect(mockPublish).toHaveBeenCalledWith(followshipCreatedContent);
});

it.todo("can not follow same user twice");
