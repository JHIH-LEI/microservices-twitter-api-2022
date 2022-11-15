import { User } from "../../models/user";
import { UserUpdatedConsumer } from "../user-updated";
import { Types } from "mongoose";
import { connection } from "../../app";
import { UserUpdatedContent } from "@domosideproject/twitter-common";
import { Message } from "amqplib";

it("successful update user", async () => {
  // init target user for test if is be update
  const userId = new Types.ObjectId();
  const userName = "target user";
  const userAccount = "targetUser123";
  const updatedAt = new Date(
    new Date().setMinutes(new Date().getMinutes() + 120)
  );
  const createdAt = new Date();

  const user = User.build({
    _id: userId,
    name: userName,
    avatar: "",
    account: userAccount,
    version: 0,
    createdAt,
    updatedAt: createdAt,
  });

  await user.save();

  const updatedName = "updated user name";
  const updatedAvatar = "avatar url";
  const updatedAccount = "updatedAccount";

  // test
  const updatedUserContentFromQueue: UserUpdatedContent = {
    id: userId.toHexString(),
    name: updatedName,
    avatar: updatedAvatar,
    account: updatedAccount,
    updatedAt: updatedAt.toISOString(),
    version: 1,
  };

  const message = {} as Message;
  await new UserUpdatedConsumer(connection).consumeCallBack(
    updatedUserContentFromQueue,
    message
  );

  const afterUser = await User.findById(userId);
  expect(afterUser).not.toBeNull();
  expect(afterUser!.name).toEqual(updatedName);
  expect(afterUser!.account).toEqual(updatedAccount);
  expect(afterUser!.avatar).toEqual(updatedAvatar);
  expect(afterUser!.version).toEqual(1);
});

it("update with wrong version should not be update and not to be ack", async () => {
  // init target user for test if is be update
  const userId = new Types.ObjectId();
  const userName = "target user";
  const userAccount = "targetUser123";
  const updatedAt = new Date(
    new Date().setMinutes(new Date().getMinutes() + 120)
  );
  const createdAt = new Date();
  const userCurrentVersionInDB = 0;

  const user = User.build({
    _id: userId,
    name: userName,
    avatar: "",
    account: userAccount,
    version: userCurrentVersionInDB,
    createdAt,
    updatedAt: createdAt,
  });

  await user.save();

  const updatedName = "updated user name";
  const updatedAvatar = "avatar url";
  const updatedAccount = "updatedAccount";

  // test
  const updatedUserContentFromQueue: UserUpdatedContent = {
    id: userId.toHexString(),
    name: updatedName,
    avatar: updatedAvatar,
    account: updatedAccount,
    updatedAt: updatedAt.toISOString(),
    version: 10, // too new should not update wait for other version be process
  };

  const message = {} as Message;

  await new UserUpdatedConsumer(connection).consumeCallBack(
    updatedUserContentFromQueue,
    message
  );

  const afterUser = await User.findById(userId);
  expect(afterUser).not.toBeNull();
  expect(afterUser!.name).not.toEqual(updatedName);
  expect(afterUser!.account).not.toEqual(updatedAccount);
  expect(afterUser!.avatar).not.toEqual(updatedAvatar);
  expect(afterUser!.version).toEqual(userCurrentVersionInDB); // not update
});
