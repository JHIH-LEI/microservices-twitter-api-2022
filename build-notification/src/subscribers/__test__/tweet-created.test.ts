import {
  NotificationCreatedContent,
  NotificationType,
  TweetCreatedContent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { connection } from "../../index";
import { NotificationCreatedPublisher } from "../../publishers/notification-created";
import { RedisOperator } from "../../services/redis-operator";
import { TweetCreatedConsumer } from "../tweet-created";

it("notify tweet owner his subscribers that he have new tweet by publish notification:created", async () => {
  // setup
  const tweetOwnerId = new Types.ObjectId().toHexString();

  // 建立監聽tweet:created queue所傳來的properties值
  const tweetId = new Types.ObjectId().toHexString();
  const description = "new tweet is here";
  const createdAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const tweetOwnerAvatar = "";
  const tweetOwnerName = "tweet owner";

  // 建立他的訂閱戶
  const subscriberOneId = new Types.ObjectId().toHexString();
  const subscriberTwoId = new Types.ObjectId().toHexString();

  await Promise.all([
    RedisOperator.addSubscribers({
      subscriberId: subscriberOneId,
      subscribingId: tweetOwnerId,
    }),
    RedisOperator.addSubscribers({
      subscriberId: subscriberTwoId,
      subscribingId: tweetOwnerId,
    }),
  ]);

  // 建立consume時會接收的兩個參數：(1)tweet:created queue所傳來的content (2) amqp 提供的原始 message
  const tweetCreatedContent: TweetCreatedContent = {
    id: tweetId,
    description,
    createdAt,
    updatedAt,
    userId: tweetOwnerId,
    version: 0,
  };

  const message = {} as Message;

  await new TweetCreatedConsumer(connection).consumeCallBack(
    tweetCreatedContent,
    message
  );

  // 建立傳送到notification:created queue的content長怎樣

  const expectNotificationContent: Omit<
    NotificationCreatedContent,
    "notifyUserIds"
  > = {
    id: tweetId,
    type: NotificationType.Tweet,
    main: description,
    userId: tweetOwnerId,
    createdAt,
  };

  // 開始測試預期：

  expect(NotificationCreatedPublisher).toHaveBeenCalledTimes(1); // 有被實例化

  const mockNotificationCreatedPublisherInstance = (
    NotificationCreatedPublisher as jest.Mock
  ).mock.instances[0];

  const mockPublish =
    mockNotificationCreatedPublisherInstance.publish as jest.Mock;

  expect(mockPublish).toHaveBeenCalledTimes(1);

  const mockPublishCalledWithContent = mockPublish.mock.calls[0][0];

  // 因為回傳的是陣列，有順序問題，所以改成檢查是否有包含要通知的對象就好

  expect(
    mockPublishCalledWithContent.notifyUserIds.includes(subscriberOneId)
  ).toBe(true);
  expect(
    mockPublishCalledWithContent.notifyUserIds.includes(subscriberTwoId)
  ).toBe(true);

  delete mockPublishCalledWithContent.notifyUserIds;

  expect(mockPublishCalledWithContent).toEqual(expectNotificationContent);
});
