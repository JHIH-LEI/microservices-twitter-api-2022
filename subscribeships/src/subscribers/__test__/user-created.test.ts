import { UserCreatedContent } from "@domosideproject/twitter-common";
import { connection } from "../../app";
import { UserCreatedConsumer } from "../user-created";
import { Types } from "mongoose";
import { Message } from "amqplib";
import { db } from "../../models";

it("create user", async () => {
  const userId = new Types.ObjectId().toHexString();
  const content: UserCreatedContent = {
    id: userId,
    name: "test",
    avatar: "test",
    version: 0,
    account: "testtest",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const message = {} as Message;
  await new UserCreatedConsumer(connection).consumeCallBack(content, message);

  const userInDB = await db.User.findByPk(userId).catch((err) =>
    console.error(err)
  );
  expect(userInDB).not.toBeNull();
  expect(userInDB?.id).toBe(userId);
});
