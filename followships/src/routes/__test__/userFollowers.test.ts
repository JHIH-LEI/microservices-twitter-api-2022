import request from "supertest";
import { app } from "../../app";
import { db } from "../../models/index";
const { User, Followship } = db;
export const createUser = async (userId: number) => {
  await User.create({
    id: userId,
    name: `user${userId}`,
    avatar: "",
    account: `${userId}AAAAAAA`,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 0,
  });
};
it("return target user followers", async () => {
  jest.setTimeout(10000);
  const targetUserId = 1;
  await Promise.all([createUser(targetUserId), createUser(2), createUser(3)]);

  await Followship.create({
    followerId: 2,
    followingId: targetUserId,
  });

  await Followship.create({
    followerId: 3,
    followingId: targetUserId,
  });

  const res = await request(app)
    .get(`/api/followships/${targetUserId}/followers`)
    .set("Cookie", global.getCookie(2))
    .expect(200);
  expect(res.body.length).toBe(2);

  expect(res.body[0].Followers).toHaveProperty("id");
  expect(res.body[0].Followers).toHaveProperty("name");
  expect(res.body[0].Followers).toHaveProperty("avatar");
  expect(res.body[0].Followers).toHaveProperty("account");
  expect(res.body[0].Followers).toHaveProperty("isFollowings");

  expect(res.body[0].Followers.isFollowings).toBe(res.body[0].id === 1 ? 1 : 0);
});
