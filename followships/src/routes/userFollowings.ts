import express, { Request, Response } from "express";
import { requireAuth, currentUser } from "@domosideproject/twitter-common";
// import { sequelize } from "../index";
// import { User } from "../models/user";
import { db } from "../models/index";
const { User, sequelize } = db;
const router = express.Router();

type UserFollowingsResOne = {
  Followers: {
    id: number;
    name: string;
    account: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

type UserFollowingsResAll = Array<UserFollowingsResOne>;

router.get(
  "/:userId/followings",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const targetUser = req.params.userId;
    let users;
    try {
      users = await User.findAll({
        where: { id: targetUser },
        raw: true,
        nest: true,
        attributes: [],
        include: {
          model: User,
          as: "Followings",
          attributes: [
            "id",
            "name",
            "account",
            "avatar",
            [
              sequelize.literal(
                `EXISTS (SELECT 1 FROM Followships WHERE followerId = ${targetUser} AND followingId = Followings.id)`
              ),
              "isFollowings",
            ],
          ],
          through: { attributes: [] },
        },
        order: [[sequelize.col("Followings.Followship.createdAt"), "DESC"]],
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

    res.send(users);
  }
);

export { router as userFollowings };
