import { SubscribeshipCreatedContent } from "@domosideproject/twitter-common";
import request from "supertest";
import { app } from "../../app";
import { db } from "../../models/index";
import { SubscribeshipCreatedPublisher } from "../../publishers/subscribeship-created";
const { User } = db;
jest.setTimeout(10000);
it("start subscribe", async () => {
  jest.setTimeout(10000);
  const date = new Date();
  const [loginUser, targetUser] = await Promise.all([
    User.create({
      id: "1",
      createdAt: date,
      updatedAt: date,
      name: "loginUser",
      avatar: "loginUser",
    }),
    User.create({
      id: "2",
      createdAt: date,
      updatedAt: date,
      name: "targetUser",
      avatar: "targetUser",
    }),
  ]);

  await request(app)
    .post(`/api/subscribeships/${targetUser.id}`)
    .set("Cookie", global.getCookie(loginUser.id))
    .expect(201);

  const subscribeshipInDB = await db.Subscribeship.findOne({
    where: { subscriberId: loginUser.id, subscribingId: targetUser.id },
  });

  expect(subscribeshipInDB).not.toBeNull();

  // publish
  expect(SubscribeshipCreatedPublisher).toHaveBeenCalledTimes(1);
  const mockPublish = (SubscribeshipCreatedPublisher as jest.Mock).mock
    .instances[0].publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);

  const content: SubscribeshipCreatedContent = {
    subscriberId: subscribeshipInDB!.subscriberId,
    subscribingId: subscribeshipInDB!.subscribingId,
    name: "loginUser",
    avatar: "loginUser",
    createdAt: subscribeshipInDB!.createdAt.toISOString(),
  };

  expect(mockPublish).toHaveBeenCalledWith(content);
});
