import {
  currentUser,
  DBError,
  requireAuth,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { Like } from "../models/like";
import { Reply } from "../models/reply";
import { Tweet } from "../models/tweet";
import { User } from "../models/user";
import { Types } from "mongoose";
const router = express.Router();

router.get(
  "/",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const loginUserObjectId = new Types.ObjectId(req.currentUser!.id);
    const tweets = await Tweet.aggregate([
      {
        $lookup: {
          from: Like.collection.name,
          localField: "_id",
          foreignField: "tweetId",
          as: "likes",
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
          from: User.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                id: "$_id",
                name: 1,
                avatar: 1,
                account: 1,
              },
            },
            { $project: { version: 0, _id: 0 } },
          ],
        },
      },
      {
        $project: {
          id: "$_id",
          _id: 0,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            $arrayElemAt: ["$user", 0],
          },
          totalLikes: {
            $size: "$likes",
          },
          totalReplies: {
            $size: "$replies",
          },
          isLiked: {
            $size: {
              $filter: {
                input: "$likes",
                as: "like",
                cond: { $eq: ["$$like.userId", loginUserObjectId] },
              },
            },
          },
        },
      },
    ]).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });
    res.send(tweets);
  }
);

export { router as indexTweetRouter };
