import express, { NextFunction, Request, Response } from "express";
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetUser = req.params.userId;
      const users = await db.User.findAll({
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
                `EXISTS (SELECT 1 FROM ${db.Followship.tableName} WHERE followerId = ${targetUser} AND followingId = Followings.id)`
              ),
              "isFollowings",
            ],
          ],
          through: { attributes: [] },
        },
        order: [[db.sequelize.col("Followings.Followship.createdAt"), "DESC"]],
      }).catch((err: any) => {
        throw new DBError(err);
      });

      if (users === null) {
        throw new ConflictError("user not exist");
      }

      res.send(users);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export { router as userFollowings };
