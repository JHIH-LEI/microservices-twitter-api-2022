import { LikeCreatedContent } from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import mongoose from "mongoose";
import { connection } from "../../app";
import { Like } from "../../models/like";
import { LikeCreatedConsumer } from "../like-created";

it("create new like", async () => {
  const likeId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const tweetId = new mongoose.Types.ObjectId().toHexString();
  const createdAt = new Date().toISOString();
  const content: LikeCreatedContent = {
    id: likeId,
    userId,
    tweetId,
    createdAt,
    name: "",
    avatar: "",
  };
  const message = {} as Message;
  await new LikeCreatedConsumer(connection).consumeCallBack(content, message);

  const newLikeInDB = await Like.findById(likeId);
  expect(newLikeInDB).not.toBeNull();
});
