import { UserCreatedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { connection } from "../../app";
import { UserCreatedConsumer } from "../user-created";
import { Message } from "amqplib";
import { User } from "../../models/user";

it("create new user when receive content from user:created queue", async () => {
  const id = new Types.ObjectId().toHexString();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  const name = "new user";
  const avatar = "new avatar";
  const account = "new account";
  const contentFromQueue: UserCreatedContent = {
    id,
    createdAt,
    updatedAt,
    version: 0,
    name,
    avatar,
    account,
  };

  const message = {} as Message;

  await new UserCreatedConsumer(connection).consumeCallBack(
    contentFromQueue,
    message
  );

  const userInDB = await User.findOne({ id });
  expect(userInDB).not.toBeNull();
  expect(userInDB!.name).toBe(name);
  expect(userInDB!.version).toBe(0);
  expect(userInDB!.account).toBe(account);
  expect(userInDB!.avatar).toBe(avatar);
  expect(userInDB!.createdAt).toEqual(new Date(createdAt));
  expect(userInDB!.updatedAt).toEqual(new Date(updatedAt));
});
