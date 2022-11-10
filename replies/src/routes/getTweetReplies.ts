import express, { Request, Response } from "express";
const router = express.Router();
import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
} from "@domosideproject/twitter-common";
import { Reply } from "../models/reply";
import { param } from "express-validator";
import { Types } from "mongoose";
import { User } from "../models/user";

router.get(
  "/tweets/:tweetId",
  currentUser,
  requireAuth,
  [
    param("tweetId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("tweetId is not valid."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const tweetObjectId = new Types.ObjectId(req.params.tweetId);

    const replies = await Reply.aggregate([
      { $match: { tweetId: tweetObjectId } },
      {
        $lookup: {
          from: User.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                id: "$_id",
                name: 1,
                account: 1,
                avatar: 1,
              },
            },
            {
              $project: {
                version: 0,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          user: { $arrayElemAt: ["$user", 0] },
          comment: 1,
          // TODO: 待前端決定要抓createdAt or updatedAt, 先在全部傳
          createdAt: 1,
          updatedAt: 1,
          // version: 0,
          // userId: 0,
          id: "$_id",
          _id: 0,
        },
      },
      { $sort: { createdAt: 1 } },
    ]).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    res.send(replies);
  }
);

export { router as getTweetRepliesRouter };
