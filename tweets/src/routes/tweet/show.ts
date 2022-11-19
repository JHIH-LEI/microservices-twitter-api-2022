import { ConflictError, DBError } from "@domosideproject/twitter-common";
import { NextFunction, Request, Response } from "express";
import { Tweet } from "../../models/tweet";
import { Types } from "mongoose";
import { Like } from "../../models/like";
import { User } from "../../models/user";
import { Reply } from "../../models/reply";

export const showTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tweetId = new Types.ObjectId(req.params.tweetId);
    const loginUserId = new Types.ObjectId(req.currentUser!.id);

    const tweet = await Tweet.aggregate([
      {
        $match: { _id: { $eq: tweetId } },
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
          totalReplies: { $size: "$replies" },
          totalLikes: { $size: "$likes" },
          user: {
            $arrayElemAt: ["$user", 0],
          },
          isLiked: {
            // size，返回filter到多少筆（長度），找到為1,沒找到0
            $size: {
              // filter出按贊列表中userId===登入使用者的資料
              $filter: {
                input: "$likes",
                as: "like",
                cond: {
                  $eq: ["$$like.userId", loginUserId],
                },
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]).catch((err) => {
      throw new DBError(JSON.stringify(err));
    });

    if (tweet.length === 0) {
      throw new ConflictError(`can not find tweet: ${tweetId}`);
    }

    res.send(tweet[0]);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
