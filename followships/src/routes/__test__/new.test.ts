import request from "supertest";
import { app } from "../../app";
// import { User } from "../../models/user";
import { db } from "../../models/index";
const { User } = db;

it("start follow", async () => {
  jest.setTimeout(10000);
  const [loginUser, targetUser] = await Promise.all([
    User.create({
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "follower",
      avatar: "",
      account: "12345678",
      version: 0,
    }),
    User.create({
      id: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "following me",
      avatar: "",
      account: "22222222",
      version: 0,
    }),
  ]);

  return request(app)
    .post(`/api/followships/${targetUser.id}`)
    .set("Cookie", global.getCookie(loginUser.id))
    .expect(201);
});
