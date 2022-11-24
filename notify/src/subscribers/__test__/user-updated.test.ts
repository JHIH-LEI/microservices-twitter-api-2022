import { UserCreatedConsumer } from "../user-created";
import amqp from "amqplib";
import { UserUpdatedContent } from "@domosideproject/twitter-common";
import mongoose from "mongoose";
import { User } from "../../models/user";
import { UserUpdatedConsumer } from "../user-updated";

it("update user", async () => {
  const connection = {} as amqp.Connection;
  const channel = {} as amqp.Channel;
  const message = {} as amqp.Message;

  const userId = new mongoose.Types.ObjectId();

  const oldUser = User.build({
    _id: userId,
    name: "oldName",
    avatar: "oldAvatar",
    version: 0,
  });

  await oldUser.save();

  const updatedUserContent: UserUpdatedContent = {
    id: userId.toHexString(),
    name: "newUserName",
    avatar: "newUserAvatar",
    account: "newUserAccount",
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  await new UserUpdatedConsumer(connection, channel).consumeCallBack(
    updatedUserContent,
    message
  );

  const updatedUserInDB = await User.findById(updatedUserContent.id);
  expect(updatedUserInDB).not.toBeNull();
  expect(updatedUserInDB!.name).toEqual(updatedUserContent.name);
  expect(updatedUserInDB!.avatar).toEqual(updatedUserContent.avatar);
  expect(updatedUserInDB!.version).toEqual(updatedUserContent.version);
});

it("can not update user because not match version", async () => {
  const connection = {} as amqp.Connection;
  const channel = {} as amqp.Channel;
  const message = {} as amqp.Message;

  const userId = new mongoose.Types.ObjectId();

  const oldUser = User.build({
    _id: userId,
    name: "oldName",
    avatar: "oldAvatar",
    version: 0,
  });

  await oldUser.save();

  const updatedUserContent: UserUpdatedContent = {
    id: userId.toHexString(),
    name: "newUserName",
    avatar: "newUserAvatar",
    account: "newUserAccount",
    version: 3,
    updatedAt: new Date().toISOString(),
  };

  await new UserUpdatedConsumer(connection, channel).consumeCallBack(
    updatedUserContent,
    message
  );

  const updatedUserInDB = await User.findById(updatedUserContent.id);
  expect(updatedUserInDB).not.toBeNull();
  expect(updatedUserInDB!.name).toEqual(oldUser.name);
  expect(updatedUserInDB!.avatar).toEqual(oldUser.avatar);
  expect(updatedUserInDB!.version).toEqual(oldUser.version);
});
