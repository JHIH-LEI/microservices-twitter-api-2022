import {
  NotificationCreatedContent,
  NotificationType,
  ReplyCreatedContent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib/properties";
import mongoose from "mongoose";
import { connection } from "../../index";
import { NotificationCreatedPublisher } from "../../publishers/notification-created";
import { RedisOperator } from "../../services/redis-operator";
import { ReplyCreatedConsumer } from "../reply-created";

it("notify tweet owner that have new reply by trigger user", async () => {
  const tweetId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const id = new mongoose.Types.ObjectId().toHexString();
  const createdAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const avatar = "";
  const comment = "new reply";
  const tweetOwnerId = new mongoose.Types.ObjectId().toHexString();
  const message = {} as Message;

  await RedisOperator.addTweetOwnerId({ tweetId, userId: tweetOwnerId });

  const replyCreatedContent: ReplyCreatedContent = {
    id,
    tweetId,
    updatedAt,
    createdAt,
    comment,
    userId,
    version: 0,
  };

  await new ReplyCreatedConsumer(connection).consumeCallBack(
    replyCreatedContent,
    message
  );

  expect(NotificationCreatedPublisher as jest.Mock).toHaveBeenCalled();

  const mockNotificationCreatedPublisherInstance = (
    NotificationCreatedPublisher as jest.Mock
  ).mock.instances[0];

  const mockPublish =
    mockNotificationCreatedPublisherInstance.publish as jest.Mock;

  expect(mockPublish).toHaveBeenCalledTimes(1);

  const expectNotificationContent: NotificationCreatedContent = {
    id: tweetId,
    type: NotificationType.Reply,
    userId,
    createdAt,
    main: comment,
    notifyUserIds: [tweetOwnerId],
  };

  expect(mockPublish.mock.calls[0][0]).toEqual(expectNotificationContent);
});
