import express, { Request, Response } from "express";
import { requireAuth, currentUser } from "@domosideproject/twitter-common";
// import { sequelize } from "../index";
// import { User } from "../models/user";
import { db } from "../models/index";
const { User, sequelize } = db;
const router = express.Router();

type UserFollowersResOne = {
  Followers: {
    id: number;
    name: string;
    account: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

type UserFollowersResAll = Array<UserFollowersResOne>;

router.get(
  "/:userId/followers",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const targetUser = req.params.userId;

    let users;
    try {
      users = await User.findAll({
        attributes: [],
        raw: true,
        nest: true,
        where: { id: targetUser },
        include: [
          {
            model: User,
            as: "Followers",
            attributes: [
              "id",
              "name",
              "account",
              "avatar",
              [
                sequelize.literal(
                  `EXISTS (SELECT 1 FROM Followships WHERE followerId = ${
                    req.currentUser!.id
                  } AND followingId = Followers.id)`
                ),
                "isFollowings",
              ],
            ],
            through: { attributes: [] }, // not include any attributes in followship table
          },
        ],
        order: [[sequelize.col("Followers.Followship.createdAt"), "DESC"]],
      });
    } catch (err: any) {
      // TODO: db error
      console.error("db error", err);
      throw new Error(err);
    }

    // TODO: 404
    if (users === null) {
      throw new Error("user not exist");
    }
    console.log("userFollowers:", users);
    res.send(users);
  }
);
export { router as userFollowers };
