import { currentUser, requireAuth } from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
// import { sequelize } from "../index";
import { Op } from "sequelize";
// import { User } from "../models/user";
const router = express.Router();
import { db } from "../models/index";
const { User, sequelize } = db;

export type TopUserResOne = {
  id: number;
  name: string;
  account: string;
  avatar: string;
  totalFollowers: number;
  isFollowings: number;
};

type TopUserResAll = Array<TopUserResOne>;

router.get(
  "/topUser",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    // TODO: db error
    const users = await User.findAll({
      raw: true,
      nest: true,
      group: "User.id",
      attributes: [
        "id",
        "name",
        "account",
        "avatar",
        [
          sequelize.literal(
            "(SELECT COUNT(DISTINCT id) FROM Followships WHERE followingId = User.id)"
          ),
          "totalFollowers",
        ],
        [
          sequelize.literal(
            `EXISTS (SELECT 1 FROM Followships WHERE followerId = ${
              req.currentUser!.id
            } AND followingId = User.id)`
          ),
          "isFollowings",
        ],
      ],
      include: {
        model: User,
        as: "Followers",
        attributes: [],
        through: { attributes: [] },
      },
      order: [[sequelize.col("totalFollowers"), "DESC"]],
      subQuery: false, //避免因查詢多張表造成limit失常
      having: { totalFollowers: { [Op.gt]: 0 } }, //只要粉絲大於0的人
      limit: 10,
    });
    res.send(users);
  }
);

export { router as topUserRouter };
