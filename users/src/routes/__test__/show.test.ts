import request from "supertest";
import { app } from "../../app";
import { User } from "../../models/user";

it("return user data", async function () {
  const user = User.build({
    name: "test",
    email: "test@email.com",
    password: "12345662341",
    account: "user1",
  });
  await user.save();

  const newUser = await User.findOne({ email: "test@email.com" });

  expect(newUser).not.toBeNull();

  const res = await request(app).get(`/api/users/${newUser!.id}`).expect(200);

  const returnUserObject = {
    id: newUser!.id,
    name: newUser!.name,
    account: newUser!.account,
    intro: newUser!.intro,
    avatar: newUser!.avatar,
    banner: newUser!.banner,
    totalFollowers: 0,
    totalFollowings: 0,
    totalTweets: 0,
    isFollowings: false,
    isSubscribing: false,
  };

  expect(res.body).toEqual(returnUserObject);
});
