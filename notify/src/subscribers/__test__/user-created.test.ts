import { UserCreatedConsumer } from "../user-created";
import amqp from "amqplib";
import { UserCreatedContent } from "@domosideproject/twitter-common";
import mongoose from "mongoose";
import { User } from "../../models/user";

it("create user", async () => {
  const connection = {} as amqp.Connection;
  const channel = {} as amqp.Channel;
  const message = {} as amqp.Message;

  const newUserContent: UserCreatedContent = {
    id: new mongoose.Types.ObjectId().toHexString(),
    name: "newUserName",
    avatar: "newUserAvatar",
    account: "newUserAccount",
    version: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await new UserCreatedConsumer(connection, channel).consumeCallBack(
    newUserContent,
    message
  );

  const newUserInDB = await User.findById(newUserContent.id);
  expect(newUserInDB).not.toBeNull();
  expect(newUserInDB!.name).toEqual(newUserContent.name);
  expect(newUserInDB!.avatar).toEqual(newUserContent.avatar);
  expect(newUserInDB!.version).toEqual(newUserContent.version);
});
