import express, { Request, Response } from "express";
const router = express.Router();
import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
} from "@domosideproject/twitter-common";
import { Like } from "../models/like";
import { param } from "express-validator";
import { Types } from "mongoose";

router.delete(
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

    await Like.deleteOne({ userId: likedUserId, tweetId }).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    res.status(204).send("ok");
  }
);

export { router as deleteLikeRouter };
