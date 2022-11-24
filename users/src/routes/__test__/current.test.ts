import request from "supertest";
import { app } from "../../app";

it("response with details about current user", async () => {
  const cookie = global.getCookie();
  const res = await request(app)
    .get("/api/users/current")
    .set("Cookie", cookie);

  expect(res.body.currentUser).toBeDefined();
});
