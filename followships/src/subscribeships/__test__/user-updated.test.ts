import {
  UserCreatedContent,
  UserUpdatedContent,
} from "@domosideproject/twitter-common";
import { Message } from "amqplib";
import { Types } from "mongoose";
import { connection } from "../../app";
import { db } from "../../models";
import { UserCreatedConsumer } from "../user-created";
import { UserUpdatedConsumer } from "../user-updated";

it("updated user", async () => {
  const userBeforeName = "userName";
  const userBeforeAccount = "userAccount";
  const userBeforeAvatar = "userAvatar";
  const createdAt = new Date();
  // set to sql time
  createdAt.setMilliseconds(0);

  const userId = new Types.ObjectId().toHexString();

  const userCreatedContent: UserCreatedContent = {
    id: userId,
    name: userBeforeName,
    account: userBeforeAccount,
    avatar: userBeforeAvatar,
    version: 0,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  const message = {} as Message;

  await new UserCreatedConsumer(connection).consumeCallBack(
    userCreatedContent,
    message
  );

  const userAfterName = "updated";
  const userAfterAccount = "updated";
  const userAfterAvatar = "updated";
  const updatedAt = new Date();
  // set to sql time
  updatedAt.setMilliseconds(0);
  const userUpdatedContent: UserUpdatedContent = {
    id: userId,
    name: userAfterName,
    account: userAfterAccount,
    avatar: userAfterAvatar,
    version: 1,
    updatedAt: updatedAt.toISOString(),
  };

  await new UserUpdatedConsumer(connection).consumeCallBack(
    userUpdatedContent,
    message
  );

  const updatedUserInDB = await db.User.findByPk(userId);
  expect(updatedUserInDB).not.toBeNull();
  expect(updatedUserInDB!.name).toBe(userAfterName);
  expect(updatedUserInDB!.account).toBe(userAfterAccount);
  expect(updatedUserInDB!.avatar).toBe(userAfterAvatar);
  expect(updatedUserInDB!.version).toBe(1);
});

it("do not updated user because wrong version should wait", async () => {
  const userId = new Types.ObjectId().toHexString();
  const userBeforeName = "userName";
  const userBeforeAccount = "userAccount";
  const userBeforeAvatar = "userAvatar";
  const createdAt = new Date();
  const originalVersion = 0;
  // set to sql time
  createdAt.setMilliseconds(0);

  const userCreatedContent: UserCreatedContent = {
    id: userId,
    name: userBeforeName,
    account: userBeforeAccount,
    avatar: userBeforeAvatar,
    version: originalVersion,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  const message = {} as Message;

  await new UserCreatedConsumer(connection).consumeCallBack(
    userCreatedContent,
    message
  );

  const userAfterName = "updated";
  const userAfterAccount = "updated";
  const userAfterAvatar = "updated";
  const updatedAt = new Date();
  // set to sql time
  updatedAt.setMilliseconds(0);
  const userUpdatedContent: UserUpdatedContent = {
    id: userId,
    name: userAfterName,
    account: userAfterAccount,
    avatar: userAfterAvatar,
    version: 10, // too new should not be process
    updatedAt: updatedAt.toISOString(),
  };

  await new UserUpdatedConsumer(connection).consumeCallBack(
    userUpdatedContent,
    message
  );

  const updatedUserInDB = await db.User.findByPk(userId);
  expect(updatedUserInDB).not.toBeNull();
  expect(updatedUserInDB!.name).toBe(userBeforeName);
  expect(updatedUserInDB!.account).toBe(userBeforeAccount);
  expect(updatedUserInDB!.avatar).toBe(userBeforeAvatar);
  expect(updatedUserInDB!.version).toBe(originalVersion);
});
