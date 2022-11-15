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
import { Tweet } from "../models/tweet";

router.get(
  "/users/:userId",
  currentUser,
  requireAuth,
  [
    param("userId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("userId is not valid."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const userObjectId = new Types.ObjectId(req.params.userId);

    // 推文者的個人資料(id,account)，推文資料不用返回
    // 回覆的資料，除了id,userId之外都傳，不需要回傳replyUser的資料

    const replies = await Reply.aggregate([
      { $match: { userId: userObjectId } },
      {
        $lookup: {
          from: Tweet.collection.name,
          localField: "tweetId",
          foreignField: "_id",
          as: "tweet",
          pipeline: [
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
                      account: 1,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      name: 0,
                      avatar: 0,
                      version: 0,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                id: "$_id",
                name: 1,
                account: 1,
                avatar: 1,
                user: { $arrayElemAt: ["$user", 0] },
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
          tweet: { $arrayElemAt: ["$tweet", 0] },
          comment: 1,
          // TODO: 待前端決定要抓createdAt or updatedAt, 先在全部傳
          createdAt: 1,
          updatedAt: 1,
          _id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    res.send(replies);
  }
);

export { router as getUserRepliesRouter };
