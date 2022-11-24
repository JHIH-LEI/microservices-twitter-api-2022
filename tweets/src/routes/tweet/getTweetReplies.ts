import { Request, Response } from "express";
import { DBError } from "@domosideproject/twitter-common";
import { Reply } from "../../models/reply";
import { Types } from "mongoose";
import { User } from "../../models/user";

export const getTweetReplies = async (req: Request, res: Response) => {
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
};
