import request from "supertest";
import { app } from "../../app";
import { Tweet } from "../../models/tweet";
import { User } from "../../models/user";
import { Types } from "mongoose";

it("return 400 because description over 140 words", async () => {
  const loginUser = await User.create({
    name: "test",
    avatar: "sss",
    account: "1234",
  });

  const description = "new".repeat(140);
  await request(app)
    .post("/api/tweets")
    .set("Cookie", global.getCookie(new Types.ObjectId(loginUser.id)))
    .send({
      description,
    })
    .expect(400);
});

it("return 201 by provide valid input", async () => {
  const loginUser = await User.create({
    name: "test",
    avatar: "ss",
    account: "1234",
  });
  const description = `new! ${new Date()}`;
  const res = await request(app)
    .post("/api/tweets")
    .set("Cookie", global.getCookie(new Types.ObjectId(loginUser.id)))
    .send({
      description,
    })
    .expect(201);

  const newTweet = await Tweet.findOne({ description });
  expect(newTweet).not.toBeNull();
  expect(res.body).toEqual(newTweet!.id);
});

it("return 401 bc not login", async () => {
  return request(app)
    .post("/api/tweets")
    .send({
      description: "new!",
    })
    .expect(401);
});
