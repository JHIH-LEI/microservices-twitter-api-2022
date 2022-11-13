import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
  NotFoundError,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { Types } from "mongoose";
import { param } from "express-validator";
import { Like } from "../models/like";
import { LikeCreatedPublishers } from "../publishers/like-created";
import { connection } from "../app";
import { User } from "../models/user";
const router = express.Router();

router.post(
  "/:tweetId",
  currentUser,
  requireAuth,
  [
    param("tweetId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("tweetId is not valid."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { tweetId } = req.params;
    const likedUserId = req.currentUser?.id;

    const newLike = Like.build({
      tweetId: new Types.ObjectId(tweetId),
      userId: new Types.ObjectId(likedUserId),
    });

    await newLike.save().catch((err: any) => {
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

    await new LikeCreatedPublishers(connection).publish({
      id: newLike!.id,
      tweetId: newLike!.tweetId.toString(),
      createdAt: newLike!.createdAt.toISOString(),
      userId: likedUserId!,
      name: user!.name,
      avatar: user!.avatar,
    });

    res.status(201).send("ok");
  }
);

export { router as newLikeRouter };
