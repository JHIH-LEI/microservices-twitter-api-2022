import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { Types } from "mongoose";
import { param } from "express-validator";
import { Like } from "../models/like";
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

    // prevent like more then once
    await Like.findOneAndUpdate(
      { tweetId, userId: likedUserId },
      { tweetId, userId: likedUserId },
      { upsert: true }
    ).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    res.status(201).send("ok");
  }
);

export { router as newLikeRouter };
