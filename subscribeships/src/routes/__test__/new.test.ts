import request from "supertest";
import { app } from "../../app";
import { db } from "../../models/index";
const { User } = db;
jest.setTimeout(10000);
it("start subscribe", async () => {
  jest.setTimeout(10000);
  const [loginUser, targetUser] = await Promise.all([
    User.create({
      id: "1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    User.create({
      id: "2",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ]);

  return request(app)
    .post(`/api/subscribeships/${targetUser.id}`)
    .set("Cookie", global.getCookie(loginUser.id))
    .expect(201);
});
