import request from "supertest";
import { app } from "../../app";
import { db } from "../../models/index";
import { TopUserResOne } from "../topUser";
const { User, Followship } = db;

jest.setTimeout(10000);
it("get top 10 user orderBy followers number", async () => {
  const userIds = [];
  // create 12 user
  for (let i = 1; i < 13; i++) {
    const user = await User.create({
      id: i,
      createdAt: new Date(),
      updatedAt: new Date(),
      account: `topUser${i}`,
      avatar: "",
      name: `user${i}`,
    });
    userIds.push(user.id);
  }
  // create followship
  const top1UserId = userIds[0]; // 3 followers
  const top2UserId = userIds[1]; // 2 followers
  const top3UserId = userIds[2]; // 1 followers
  const loginUserId = userIds[4]; // id:5
  await Promise.all([
    // user 4,5,6 follow user 1
    Followship.create({ followerId: userIds[3], followingId: top1UserId }),
    Followship.create({ followerId: loginUserId, followingId: top1UserId }),
    ,
    Followship.create({
      followerId: userIds[5],
      followingId: top1UserId,
    }),
    // user 4,5 follow user 2
    Followship.create({ followerId: userIds[3], followingId: top2UserId }),
    Followship.create({ followerId: loginUserId, followingId: top2UserId }),
    // user 5 follow user 3
    Followship.create({ followerId: userIds[3], followingId: top3UserId }),
  ]);

  const res = await request(app)
    .get("/api/followships/topUser")
    .set("Cookie", global.getCookie(loginUserId))
    .expect(200);

  // 只抓粉絲大於0的使用者
  expect(res.body.length).toBe(3);

  const returnTop1User = res.body[0];
  const returnTop2User = res.body[1];
  const returnTop3User = res.body[2];

  const expectTop1User: TopUserResOne = {
    id: 1,
    name: "user1",
    account: "topUser1",
    avatar: "",
    isFollowings: 1, // true
    totalFollowers: 3,
  };
  const expectTop2User: TopUserResOne = {
    id: 2,
    name: "user2",
    account: "topUser2",
    avatar: "",
    isFollowings: 1, // true
    totalFollowers: 2,
  };
  const expectTop3User: TopUserResOne = {
    id: 3,
    name: "user3",
    account: "topUser3",
    avatar: "",
    isFollowings: 0, // false
    totalFollowers: 1,
  };
  expect(returnTop1User).toEqual(expectTop1User);
  expect(returnTop2User).toEqual(expectTop2User);
  expect(returnTop3User).toEqual(expectTop3User);
});
