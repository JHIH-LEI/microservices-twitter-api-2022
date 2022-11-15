import request from "supertest";
import { app } from "../../app";
import { User } from "../../models/user";
import { UserCreatedPublisher } from "../../publishers/user-created";
import { UserCreatedContent } from "@domosideproject/twitter-common";

it("create new user with valid input", async () => {
  const email = "test@example.com";
  const account = "user1";
  const plainPassword = "12345678";
  const name = "test user";
  const res = await request(app)
    .post("/api/users")
    .send({
      email,
      name,
      account,
      password: plainPassword,
      checkPassword: plainPassword,
    })
    .expect(201);

  expect(res.body).toBeDefined();

  // 檢查資料庫有沒有
  const users = await User.find({});
  expect(users.length).toEqual(1);
  expect(users[0].email).toEqual(email);
  expect(users[0].account).toEqual(account);
  expect(users[0].name).toEqual(name);
  expect(users[0].password).not.toEqual(plainPassword);

  // 檢查有無publish
  expect(UserCreatedPublisher).toBeCalledTimes(1);
  const mockUserCreatedPublisherInstance = (UserCreatedPublisher as jest.Mock)
    .mock.instances[0];

  const mockPublish = mockUserCreatedPublisherInstance.publish as jest.Mock;
  expect(mockPublish).toHaveBeenCalledTimes(1);
  // 檢查發布到queue的content格式是否正確
  const expectPublishContent: UserCreatedContent = {
    id: users[0].id,
    name: users[0].name,
    avatar: users[0].avatar,
    account: users[0].account,
    createdAt: users[0].createdAt.toISOString(),
    updatedAt: users[0].updatedAt.toISOString(),
    version: users[0].version,
  };
  expect(mockPublish).toHaveBeenCalledWith(expectPublishContent);
});

it.todo("invalid result test");
