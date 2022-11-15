import express, { Request, Response } from "express";
import {
  requireAuth,
  currentUser,
  DBError,
  ConflictError,
} from "@domosideproject/twitter-common";
import { db } from "../models/index";
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
      users = await db.User.findAll({
        where: { id: targetUser },
        raw: true,
        nest: true,
        attributes: [],
        include: {
          model: db.User,
          as: "Followings",
          attributes: [
            "id",
            "name",
            "account",
            "avatar",
            [
              db.sequelize.literal(
                `EXISTS (SELECT 1 FROM Followships WHERE followerId = ${targetUser} AND followingId = Followings.id)`
              ),
              "isFollowings",
            ],
          ],
          through: { attributes: [] },
        },
        order: [[db.sequelize.col("Followings.Followship.createdAt"), "DESC"]],
      });
    } catch (err: any) {
      console.error("db error", err);
      throw new DBError(err);
    }

    if (users === null) {
      throw new ConflictError("user not exist");
    }

    res.send(users);
  }
);

export { router as userFollowings };
