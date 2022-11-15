import { LikeCreatedConsumer } from "../like-created";
import { connection } from "../../index";
import {
  LikeCreatedContent,
  NotificationCreatedContent,
  NotificationType,
} from "@domosideproject/twitter-common";
import mongoose from "mongoose";
import { Message } from "amqplib";
import { RedisOperator } from "../../services/redis-operator";
import { NotificationCreatedPublisher } from "../../publishers/notification-created";

it("notify tweet owner", async () => {
  const tweetId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const id = new mongoose.Types.ObjectId().toHexString();
  const createdAt = new Date().toISOString();
  const name = "likerUser";
  const avatar = "";
  const tweetOwnerId = new mongoose.Types.ObjectId().toHexString();

  await RedisOperator.addTweetOwnerId({ tweetId, userId: tweetOwnerId });

  const likeCreatedContent: LikeCreatedContent = {
    tweetId,
    userId,
    id,
    name,
    avatar,
    createdAt,
  };

  const message = {} as Message;

  await new LikeCreatedConsumer(connection).consumeCallBack(
    likeCreatedContent,
    message
  );

  // 通知內文是否正確
  const expectNotificationContent: NotificationCreatedContent = {
    id: tweetId,
    user: {
      id: userId,
      name,
      avatar,
    },
    type: NotificationType.Like,
    main: "",
    createdAt,
    notifyUserIds: [tweetOwnerId],
  };

  // 是否有publish
  expect(NotificationCreatedPublisher as jest.Mock).toHaveBeenCalled();

  const mockNotificationCreatedPublisherInstance = (
    NotificationCreatedPublisher as jest.Mock
  ).mock.instances[0];

  const mockPublish =
    mockNotificationCreatedPublisherInstance.publish as jest.Mock;

  expect(mockPublish).toHaveBeenCalledTimes(1);

  expect(mockPublish.mock.calls[0][0]).toEqual(expectNotificationContent);
});
