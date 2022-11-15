import express, { NextFunction, Request, Response } from "express";
import {
  requireAuth,
  currentUser,
  DBError,
  ConflictError,
} from "@domosideproject/twitter-common";
import { db } from "../models/index";
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetUser = req.params.userId;

      const users = await db.User.findAll({
        attributes: [],
        raw: true,
        nest: true,
        where: { id: targetUser },
        include: [
          {
            model: db.User,
            as: "Followers",
            attributes: [
              "id",
              "name",
              "account",
              "avatar",
              [
                db.sequelize.literal(
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
        order: [[db.sequelize.col("Followers.Followship.createdAt"), "DESC"]],
      }).catch((err: any) => {
        throw new DBError(JSON.stringify(err));
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
export { router as userFollowers };
