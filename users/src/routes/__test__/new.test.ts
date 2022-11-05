import request from "supertest";
import { app } from "../../app";
import { User } from "../../models/user";
import { verify } from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

it("create new user with valid input", async () => {
  const email = "test@example.com";
  const account = "user1";
  const plainPassword = 12345678;
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
});

it.todo("invalid result test");
