import {
  NotificationCreatedContent,
  NotificationType,
  SubscribeshipCreatedContent,
} from "@domosideproject/twitter-common";
import { SubscribeshipCreatedConsumer } from "../subscribeship-created";
import { Types } from "mongoose";
import { Message } from "amqplib";
import { connection } from "../../index";
import { RedisOperator } from "../../services/redis-operator";
import { NotificationCreatedPublisher } from "../../publishers/notification-created";

it("add subscriber user id in redis database ref by user:<subscribingId> and build notification that will notify subscribingId", async () => {
  const subscriberId = new Types.ObjectId().toHexString();
  const subscribingId = new Types.ObjectId().toHexString();
  const subscriberName = "subscriber";
  const subscriberAvatar = "";
  const createdAt = new Date().toISOString();

  const subscribeshipCreatedContent: SubscribeshipCreatedContent = {
    subscriberId,
    subscribingId,
    createdAt,
  };

  const message = {} as Message;

  await new SubscribeshipCreatedConsumer(connection).consumeCallBack(
    subscribeshipCreatedContent,
    message
  );
  // 檢查redis資料庫有無將新的訂閱者加進去對應的subscribing 既有訂閱他的人的列表

  const subscriberList = await RedisOperator.getSubscribers(subscribingId);

  expect(subscriberList.includes(subscriberId)).toBe(true);

  // 檢查是否有發布notification:created
  expect(NotificationCreatedPublisher).toHaveBeenCalledTimes(1);

  const mockNotificationCreatedPublisherInstance = (
    NotificationCreatedPublisher as jest.Mock
  ).mock.instances[0];

  const mockPublish =
    mockNotificationCreatedPublisherInstance.publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);
  // 檢查發布的content是否如預期

  const expectNotificationContent: NotificationCreatedContent = {
    id: subscriberId,
    type: NotificationType.Subscribe,
    userId: subscriberId,
    createdAt,
    main: "",
    notifyUserIds: [subscribingId],
  };

  expect(mockPublish.mock.calls[0][0]).toEqual(expectNotificationContent);
});
