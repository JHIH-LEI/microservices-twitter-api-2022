import { UserCreatedContent } from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { connection } from "../../app";
import { UserCreatedConsumer } from "../user-created";
import { Types } from "mongoose";
import { User } from "../../models/user";

it("create user when received user content from user:created queue", async () => {
  const userId = new Types.ObjectId();
  const userName = "userName";
  const userAccount = "userAccount";
  const userAvatar = "userAvatar";
  const createdAt = new Date();

  const contentFromUserCreatedQueue: UserCreatedContent = {
    id: userId.toHexString(),
    name: userName,
    account: userAccount,
    avatar: userAvatar,
    version: 0,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  const message = {} as Message;
  await new UserCreatedConsumer(connection).consumeCallBack(
    contentFromUserCreatedQueue,
    message
  );

  const newUserInDB = await User.findById(userId);
  expect(newUserInDB).not.toBeNull();
  expect(newUserInDB!.name).toEqual(userName);
  expect(newUserInDB!.avatar).toEqual(userAvatar);
  expect(newUserInDB!.account).toEqual(userAccount);
  expect(newUserInDB!.createdAt).toEqual(createdAt);
  expect(newUserInDB!.updatedAt).toEqual(createdAt);
  expect(newUserInDB!.version).toEqual(0);
});
