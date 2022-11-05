import request from "supertest";
import { app } from "../../app";

it("signin faild due to invalid email", async () => {
  return await request(app)
    .post("/api/users/signin")
    .send({ email: "ss", password: "password" })
    .expect(400);
});

it("signin faild due to empaty password", async () => {
  return await request(app)
    .post("/api/users/signin")
    .send({ email: "test@gmail.com", password: "   " })
    .expect(400);
});

it("it should fail bc not match password", async () => {
  await request(app)
    .post("/api/users")
    .send({ email: "test@gmail.com", password: "password" })
    .expect(201);
  await request(app)
    .post("/api/users/signin")
    .send({ email: "test@gmail.com", password: "pass" })
    .expect(400);
});

it("it should have cookie header after login successfully", async () => {
  await request(app)
    .post("/api/users")
    .send({ email: "test@gmail.com", password: "password" })
    .expect(201);
  const res = await request(app)
    .post("/api/users/signin")
    .send({ email: "test@gmail.com", password: "password" })
    .expect(200);

  expect(res.get("Set-Cookie")).toBeDefined();
});
