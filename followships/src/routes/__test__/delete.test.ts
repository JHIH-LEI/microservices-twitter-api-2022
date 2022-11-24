import { FollowshipDeletedContent } from "@domosideproject/twitter-common";
import request from "supertest";
import { app } from "../../app";
import { db } from "../../models/index";
import { FollowshipDeletedPublisher } from "../../publishers/followship-deleted";
const { User, Followship } = db;

test("unfollow and publish to followship:deleted", async () => {
  const loginUser = await User.create({
    id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "follower",
    avatar: "",
    account: "123456",
    version: 0,
  }).catch((err) => {
    throw new Error(err);
  });

  const targetUser = await User.create({
    id: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "following me",
    avatar: "",
    account: "2222222",
    version: 0,
  });

  await Followship.create({
    followerId: loginUser.id,
    followingId: targetUser.id,
  });

  await request(app)
    .delete(`/api/followships/${targetUser.id}`)
    .set("Cookie", global.getCookie(loginUser.id))
    .expect(204);

  const afterDeletedFollowship = await Followship.findOne({
    where: { followerId: loginUser.id, followingId: targetUser.id },
  });
  expect(afterDeletedFollowship).toBeNull();

  // publish

  expect(FollowshipDeletedPublisher).toBeCalledTimes(1);
  const mockPublish = (FollowshipDeletedPublisher as jest.Mock).mock
    .instances[0].publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);
  const publishContent: FollowshipDeletedContent = {
    followerId: loginUser.id,
    followingId: targetUser.id,
  };
  expect(mockPublish).toHaveBeenCalledWith(publishContent);
});

// TODO: 資料不存在不給新增/更新的話要回傳什麼？？
