import {
  currentUser,
  DBError,
  requireAuth,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
// import { sequelize } from "../index";
import { Op } from "sequelize";
// import { User } from "../models/user";
const router = express.Router();
import { db } from "../models/index";

export type TopUserResOne = {
  id: string;
  name: string;
  account: string;
  avatar: string;
  totalFollowers: number;
  isFollowings: number;
};

// TODO: write res data type

type TopUserResAll = Array<TopUserResOne>;

router.get(
  "/topUser",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    // TODO: db error
    let users;
    try {
      users = await db.User.findAll({
        raw: true,
        nest: true,
        group: "User.id",
        attributes: [
          "id",
          "name",
          "account",
          "avatar",
          [
            db.sequelize.literal(
              "(SELECT COUNT(DISTINCT id) FROM Followships WHERE followingId = User.id)"
            ),
            "totalFollowers",
          ],
          [
            db.sequelize.literal(
              `EXISTS (SELECT 1 FROM Followships WHERE followerId = ${
                req.currentUser!.id
              } AND followingId = User.id)`
            ),
            "isFollowings",
          ],
        ],
        include: {
          model: db.User,
          as: "Followers",
          attributes: [],
          through: { attributes: [] },
        },
        order: [[db.sequelize.col("totalFollowers"), "DESC"]],
        subQuery: false, //避免因查詢多張表造成limit失常
        having: { totalFollowers: { [Op.gt]: 0 } }, //只要粉絲大於0的人
        limit: 10,
      });
    } catch (error: any) {
      console.error(error);
      throw new DBError(JSON.stringify(error));
    }
    res.send(users);
  }
);

export { router as topUserRouter };
