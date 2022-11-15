import { UserCreatedContent } from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { connection } from "../../app";
import { db } from "../../models";
import { UserCreatedConsumer } from "../user-created";
it("create user", async () => {
  const userName = "userName";
  const userAccount = "userAccount";
  const userAvatar = "userAvatar";
  const createdAt = new Date();
  // set to sql time
  createdAt.setMilliseconds(0);

  const userId = new Types.ObjectId().toHexString();
  const content: UserCreatedContent = {
    id: userId,
    name: userName,
    account: userAccount,
    avatar: userAvatar,
    version: 0,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  const message = {} as Message;

  await new UserCreatedConsumer(connection).consumeCallBack(content, message);

  const userInDB = await db.User.findByPk(userId);

  expect(userId).not.toBeNull();
  expect(userInDB!.id).toBe(userId);
  expect(userInDB!.account).toBe(userAccount);
  expect(userInDB!.avatar).toBe(userAvatar);
  expect(userInDB!.name).toBe(userName);
  expect(userInDB!.createdAt).toEqual(createdAt);
  expect(userInDB!.updatedAt).toEqual(createdAt);
  expect(userInDB!.version).toBe(0);
});
