import request from "supertest";
import { app } from "../../app";
// import { User } from "../../models/user";
import { db } from "../../models/index";
const { User, Followship } = db;

test("unfollow", async () => {
  const loginUser = await User.create({
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "follower",
    avatar: "",
    account: "123456",
  });

  const targetUser = await User.create({
    id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "following me",
    avatar: "",
    account: "2222222",
  });

  await Followship.create({
    followerId: loginUser.id,
    followingId: targetUser.id,
  });

  return request(app)
    .delete(`/api/followships/${targetUser.id}`)
    .set("Cookie", global.getCookie(loginUser.id))
    .expect(204);
});

// TODO: 資料不存在不給新增/更新的話要回傳什麼？？
