import request from "supertest";
import { app } from "../../app";

beforeEach(() => {
  jest.setTimeout(50000);
});

it("signin faild due to invalid account", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({ account: "ss2311", password: "23311111111" })
    .expect(400);
});

it("signin faild due to empty password", async () => {
  return await request(app)
    .post("/api/users/signin")
    .send({
      account: "test123",
      password: "         ",
      checkPassword: "         ",
    })
    .expect(400);
});

it("it should fail bc not match password", async () => {
  await request(app)
    .post("/api/users")
    .send({
      name: "1234",
      email: "test@gmail.com",
      account: "test123",
      password: "password123456",
      checkPassword: "password123456",
    })
    .expect(201);
  await request(app)
    .post("/api/users/signin")
    .send({ account: "test123", password: "passssssssssss" })
    .expect(400);
});

it("it should have cookie header after login successfully", async () => {
  const email = "test@example.com";
  const account = "test123";
  const plainPassword = "12345678";
  const name = "test user";
  await request(app)
    .post("/api/users")
    .send({
      email,
      name,
      account,
      password: plainPassword,
      checkPassword: plainPassword,
    })
    .expect(201);

  const res = await request(app)
    .post("/api/users/signin")
    .send({ account, password: plainPassword, checkPassword: plainPassword })
    .expect(200);

  expect(res.get("Set-Cookie")).toBeDefined();
});
