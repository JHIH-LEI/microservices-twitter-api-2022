import Redis from "ioredis";
import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });

if (!process.env.REDIS_URL) {
  throw new Error("missing REDIS_URL env variable");
}

export const redis = new Redis(process.env.REDIS_URL);
