import request from "supertest";
import { app } from "../../app";
import { db } from "../../models/index";
import { SubscribeshipDeletedPublisher } from "../../publishers/subscribeship-deleted";
const { User, Subscribeship } = db;

jest.setTimeout(10000);
test("unsubscribe", async () => {
  const loginUser = await User.create({
    id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "loginUser",
    avatar: "loginUser",
  }).catch((err) => {
    throw new Error(err);
  });

  const targetUser = await User.create({
    id: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "targetUser",
    avatar: "targetUser",
  });

  await Subscribeship.create({
    subscriberId: loginUser.id,
    subscribingId: targetUser.id,
  });

  await request(app)
    .delete(`/api/subscribeships/${targetUser.id}`)
    .set("Cookie", global.getCookie(loginUser.id))
    .expect(204);

  expect(SubscribeshipDeletedPublisher).toHaveBeenCalledTimes(1);
  const mockPublish = (SubscribeshipDeletedPublisher as jest.Mock).mock
    .instances[0].publish;
  expect(mockPublish).toHaveBeenCalledTimes(1);
});

// TODO: 資料不存在不給新增/更新的話要回傳什麼？？
