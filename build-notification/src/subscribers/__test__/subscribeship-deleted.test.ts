import { SubscribeshipDeletedContent } from "@domosideproject/twitter-common";
import { connection } from "../../index";
import { SubscribeshipDeletedConsumer } from "../subscribeship-deleted";
import { Types } from "mongoose";
import { Message } from "amqplib";
import { RedisOperator } from "../../services/redis-operator";

// 從db移除，不需通知
it("remove that subscriber from subscribing's subscribers list", async () => {
  const subscriberId = new Types.ObjectId().toHexString();
  const subscribingId = new Types.ObjectId().toHexString();

  await RedisOperator.addSubscribers({ subscriberId, subscribingId });

  const subscribeshipDeletedContent: SubscribeshipDeletedContent = {
    subscriberId,
    subscribingId,
  };
  const message = {} as Message;

  await new SubscribeshipDeletedConsumer(connection).consumeCallBack(
    subscribeshipDeletedContent,
    message
  );

  const afterSubscriberList = await RedisOperator.getSubscribers(subscriberId);

  expect(afterSubscriberList.includes(subscriberId)).toBe(false);
});
