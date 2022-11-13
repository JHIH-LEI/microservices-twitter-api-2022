import express, { Request, Response } from "express";
const router = express.Router();
import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
  ConflictError,
} from "@domosideproject/twitter-common";
import { Like } from "../models/like";
import { param } from "express-validator";
import { Types } from "mongoose";
import { LikeDeletedPublishers } from "../publishers/like-deleted";
import { connection } from "../app";

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

    const deletedLike = await Like.findOneAndDelete({
      userId: likedUserId,
      tweetId,
    }).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    if (deletedLike === null) {
      throw new ConflictError("like not exist");
    }

    await new LikeDeletedPublishers(connection).publish({
      id: deletedLike!.id,
    });

    res.status(204).send("ok");
  }
);

export { router as deleteLikeRouter };
