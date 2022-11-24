import { FollowshipCreatedConsumer } from "../followship-created";
import { connection } from "../../index";
import mongoose from "mongoose";
import amqp from "amqplib";
import {
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";
import { NotificationCreatedPublisher } from "../../publishers/notification-created";

it("build notification and call publish (notificationCreated)", async () => {
  const followerId = new mongoose.Types.ObjectId().toHexString();
  const followingId = new mongoose.Types.ObjectId().toHexString();
  const createdAt = new Date().toISOString();
  // @ts-ignore
  const message: amqp.Message = {};
  await new FollowshipCreatedConsumer(connection).consumeCallBack(
    {
      followerId,
      followingId,
      createdAt,
    },
    message
  );

  // 有無publish

  const mockNotificationCreatedPublisherInstance = (
    NotificationCreatedPublisher as jest.Mock
  ).mock.instances[0];

  expect(NotificationCreatedPublisher as jest.Mock).toHaveBeenCalled(); // 在consumeCallBack中，會實例化這個publisher

  const mockPublish = mockNotificationCreatedPublisherInstance.publish;

  expect(mockPublish).toHaveBeenCalledTimes(1);

  // 檢查publish出去的content是不是我想要的樣子

  const expectPublishContent: NotificationCreatedContent = {
    id: followerId,
    type: NotificationType.Follow,
    main: "",
    createdAt,
    userId: followerId,
    notifyUserIds: [followingId],
  };

  expect((mockPublish as jest.Mock).mock.calls[0][0]).toEqual(
    expectPublishContent
  );
});
