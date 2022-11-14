import { UserUpdatedContent } from "@domosideproject/twitter-common";
import { Types } from "mongoose";
import { connection } from "../../app";
import { User } from "../../models/user";
import { UserUpdatedConsumer } from "../user-updated";
import { Message } from "amqplib";

it("successfully update user", async () => {
  const id = new Types.ObjectId();
  const oldName = "old";
  const oldAvatar = "oldAvatar";
  const oldAccount = "oldAccount";
  const createdAt = new Date();

  const user = User.build({
    _id: id,
    createdAt,
    version: 0,
    avatar: oldAvatar,
    account: oldAccount,
    name: oldName,
    updatedAt: createdAt,
  });

  await user.save();

  const updatedAt = new Date();
  const updatedName = "new";
  const updatedAvatar = "newAvatar";
  const updatedAccount = "newAccount";
  const updatedContent: UserUpdatedContent = {
    id: id.toHexString(),
    name: updatedName,
    account: updatedAccount,
    avatar: updatedAvatar,
    updatedAt: updatedAt.toISOString(),
    version: 1,
  };

  const message = {} as Message;
  // @ts-ignore
  await new UserUpdatedConsumer(connection).consumeCallBack(
    updatedContent,
    message
  );

  const afterUpdatedUserInDB = await User.findById(id);

  expect(afterUpdatedUserInDB!.name).toBe(updatedName);
  expect(afterUpdatedUserInDB!.avatar).toBe(updatedAvatar);
  expect(afterUpdatedUserInDB!.account).toBe(updatedAccount);
  expect(afterUpdatedUserInDB!.updatedAt).toEqual(updatedAt);
  expect(afterUpdatedUserInDB!.version).toBe(1);
});

it("do not update user because incoming version too new", async () => {
  const id = new Types.ObjectId();
  const oldName = "old";
  const oldAvatar = "oldAvatar";
  const oldAccount = "oldAccount";
  const createdAt = new Date();

  const user = User.build({
    _id: id,
    createdAt,
    version: 0,
    avatar: oldAvatar,
    account: oldAccount,
    name: oldName,
    updatedAt: createdAt,
  });

  await user.save();

  const updatedAt = new Date();
  const updatedName = "new";
  const updatedAvatar = "newAvatar";
  const updatedAccount = "newAccount";
  const updatedContent: UserUpdatedContent = {
    id: id.toHexString(),
    name: updatedName,
    account: updatedAccount,
    avatar: updatedAvatar,
    updatedAt: updatedAt.toISOString(),
    version: 10, //too new
  };

  const message = {} as Message;
  // @ts-ignore
  await new UserUpdatedConsumer(connection).consumeCallBack(
    updatedContent,
    message
  );

  const afterUpdatedUserInDB = await User.findById(id);

  expect(afterUpdatedUserInDB!.name).toBe(oldName);
  expect(afterUpdatedUserInDB!.avatar).toBe(oldAvatar);
  expect(afterUpdatedUserInDB!.account).toBe(oldAccount);
  expect(afterUpdatedUserInDB!.updatedAt).toEqual(createdAt);
  expect(afterUpdatedUserInDB!.version).toBe(0);
});
