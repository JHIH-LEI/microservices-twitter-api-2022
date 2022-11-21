import {
  DBError,
  NotFoundError,
  ConflictError,
  LikeCreatedContent,
} from "@domosideproject/twitter-common";
import express, { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Like } from "../../models/like";
import { LikeCreatedPublishers } from "../../publishers/like-created";
import { connection } from "../../app";
import { User } from "../../models/user";

export const newLike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tweetId } = req.params;
    const likedUserId = req.currentUser?.id;

    const newLike = Like.build({
      tweetId: new Types.ObjectId(tweetId),
      userId: new Types.ObjectId(likedUserId),
    });

    await newLike.save().catch((err: any) => {
      if (err.statusCode === 409) {
        throw new ConflictError("can not like same tweet twice");
      }
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    // publish

    const user = await User.findById(likedUserId).catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    if (user === null) {
      throw new NotFoundError(
        `user: ${likedUserId} can not be found in database`
      );
    }

    const likeCreatedContent: LikeCreatedContent = {
      id: newLike!.id.toString(),
      tweetId: newLike!.tweetId.toString(),
      createdAt: newLike!.createdAt.toISOString(),
      userId: likedUserId!,
    };

    await new LikeCreatedPublishers(connection).publish(likeCreatedContent);

    res.status(201).send("ok");
  } catch (err) {
    next(err);
  }
};
