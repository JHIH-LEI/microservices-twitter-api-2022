import { redis } from "../index";
import { DBError } from "@domosideproject/twitter-common";

enum KeyPrefix {
  Tweet = "tweet",
  Subscribeship = "user",
}

export class RedisOperator {
  /**
   *
   * @param userId 觸發通知事件的對象
   *
   */
  static async getSubscribers(userId: string) {
    const key = this.generateRedisKey({
      key: userId,
      prefix: KeyPrefix.Subscribeship,
    });
    return redis.smembers(key).catch((err: any) => {
      console.error(`get subscribers from ${key} error. ${err}`);
      throw new DBError(JSON.stringify(err));
    });
  }

  static async addSubscribers({
    subscriberId,
    subscribingId,
  }: {
    subscribingId: string;
    subscriberId: string;
  }) {
    const key = this.generateRedisKey({
      key: subscribingId,
      prefix: KeyPrefix.Subscribeship,
    });
    await redis.sadd(key, subscriberId).catch((err: any) => {
      console.error(`add ${subscriberId} from ${key} error. ${err}`);
      throw new DBError(JSON.stringify(err));
    });
  }

  static async removeSubscribers({
    subscriberId,
    subscribingId,
  }: {
    subscribingId: string;
    subscriberId: string;
  }) {
    const key = this.generateRedisKey({
      key: subscribingId,
      prefix: KeyPrefix.Subscribeship,
    });

    await redis.srem(key, subscriberId).catch((err: any) => {
      console.error(`remove ${subscriberId} from ${key} error. ${err}`);
      throw new DBError(JSON.stringify(err));
    });
  }

  static async getTweetOwnerId(tweetId: string) {
    const key = this.generateRedisKey({
      key: tweetId,
      prefix: KeyPrefix.Tweet,
    });

    return redis.get(key);
  }

  static async addTweetOwnerId({
    tweetId,
    userId,
  }: {
    tweetId: string;
    userId: string;
  }) {
    const key = this.generateRedisKey({
      key: tweetId,
      prefix: KeyPrefix.Tweet,
    });

    await redis.set(key, userId);
  }

  static async removeTweet(tweetId: string) {
    const key = this.generateRedisKey({
      key: tweetId,
      prefix: KeyPrefix.Tweet,
    });
    await redis.del(key);
  }

  static generateRedisKey = ({
    key,
    prefix,
  }: {
    key: string;
    prefix: KeyPrefix;
  }) => {
    return `${prefix}:${key}`;
  };
}
