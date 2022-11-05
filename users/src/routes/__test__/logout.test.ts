import request from "supertest";
import { app } from "../../app";

it("clear cookie after signout", async () => {
  const cookie = await global.getCookie();

  const res = await request(app)
    .post("/api/users/signout")
    .set("Cookie", cookie)
    .send({ email: "test@gmail.com", password: "password" })
    .expect(200);

  expect(res.get("Set-Cookie")[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
