import { Message } from "amqplib";
import mongoose from "mongoose";
import { connection } from "../../app";
import { Like } from "../../models/like";
import { LikeDeletedConsumer } from "../like-deleted";

it("delete like in database", async () => {
  const likeId = new mongoose.Types.ObjectId();
  const like = Like.build({
    id: likeId,
    tweetId: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
  });
  await like.save();
  const message = {} as Message;

  await new LikeDeletedConsumer(connection).consumeCallBack(
    { id: likeId.toHexString() },
    message
  );

  const afterConsumeLikeDeleted = await Like.findById(likeId);
  expect(afterConsumeLikeDeleted).toBeNull();
});
