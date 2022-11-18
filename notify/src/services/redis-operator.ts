import { DBError } from "@domosideproject/twitter-common";
import { redis } from "../redisConfig";

export class RedisOperator {
  /**
   *
   * @param userId 要通知的對象
   *
   */
  static async getNotifyUserSocketIds(userId: string) {
    return redis.smembers(userId).catch((err: any) => {
      console.error(`get ${userId} socketIds error: ${JSON.stringify(err)}`);
      throw new DBError(JSON.stringify(err));
    });
  }

  static async addNotifyUserSocketIds({
    userId,
    socketId,
  }: {
    userId: string;
    socketId: string;
  }) {
    return redis.sadd(userId, socketId).catch((err: any) => {
      console.error(
        `add ${userId} socketId :${socketId} error: ${JSON.stringify(err)}`
      );
      throw new DBError(JSON.stringify(err));
    });
  }

  static async removeNotifyUserSocketIds({
    userId,
    socketId,
  }: {
    userId: string;
    socketId: string;
  }) {
    return redis.srem(userId, socketId).catch((err: any) => {
      console.error(
        `remove ${userId} socketId :${socketId} error: ${JSON.stringify(err)}`
      );
      throw new DBError(JSON.stringify(err));
    });
  }
}
