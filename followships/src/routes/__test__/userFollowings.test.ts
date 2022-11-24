import request from "supertest";
import { app } from "../../app";
import { db } from "../../models/index";
import { createUser } from "./userFollowers.test";
const { Followship } = db;

it("return target user followings", async () => {
  jest.setTimeout(10000);
  const targetUserID = "1";
  await Promise.all([
    createUser(targetUserID),
    createUser("2"),
    createUser("3"),
  ]);

  await Followship.create({
    followerId: targetUserID,
    followingId: "2",
  });

  await Followship.create({
    followerId: targetUserID,
    followingId: "3",
  });

  const res = await request(app)
    .get(`/api/followships/${targetUserID}/followings`)
    .set("Cookie", global.getCookie(targetUserID))
    .expect(200);

  expect(res.body.length).toBe(2);
  expect(res.body[0].Followings).toHaveProperty("id");
  expect(res.body[0].Followings).toHaveProperty("name");
  expect(res.body[0].Followings).toHaveProperty("avatar");
  expect(res.body[0].Followings).toHaveProperty("account");
  expect(res.body[0].Followings).toHaveProperty("isFollowings");
  expect(res.body[0].Followings.isFollowings).toBe(1);
});
