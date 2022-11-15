import {
  DBError,
  currentUser,
  requireAuth,
  validateRequest,
} from "@domosideproject/twitter-common";
import express, { NextFunction, Request, Response } from "express";
import { param } from "express-validator";
import { Types } from "mongoose";
import { Like } from "../models/like";
import { Reply } from "../models/reply";
import { Tweet } from "../models/tweet";
import { User } from "../models/user";
const router = express.Router();

router.get(
  "/:userId",
  currentUser,
  requireAuth,
  [
    param("userId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("userId is not valid."),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetUserObjectId = new Types.ObjectId(req.params.userId);
      const loginUserObjectId = new Types.ObjectId(req.currentUser!.id);

      const likedTweets = await Like.aggregate([
        { $match: { userId: targetUserObjectId } },
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
                        _id: 0,
                        name: 1,
                        avatar: 1,
                        account: 1,
                      },
                    },
                  ],
                },
              },
              {
                $lookup: {
                  from: Reply.collection.name,
                  localField: "_id",
                  foreignField: "tweetId",
                  as: "replies",
                },
              },
              {
                $lookup: {
                  from: Like.collection.name,
                  localField: "_id",
                  foreignField: "tweetId",
                  as: "likes",
                },
              },
              {
                $project: {
                  id: "$_id",
                  _id: 0,
                  description: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  user: { $arrayElemAt: ["$user", 0] },
                  totalLikes: { $size: "$likes" },
                  totalReplies: { $size: "$replies" },
                  isLiked: {
                    $size: {
                      $filter: {
                        input: "$likes",
                        as: "like",
                        cond: {
                          $eq: ["$$like.userId", loginUserObjectId],
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            tweet: { $arrayElemAt: ["$tweet", 0] },
          },
        },
        { $sort: { createdAt: -1 } },
      ]).catch((err) => {
        throw new DBError(JSON.stringify(err));
      });

      res.send(likedTweets);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export { router as getUserLikedTweetsRouter };
