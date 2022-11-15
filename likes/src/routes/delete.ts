import express, { NextFunction, Request, Response } from "express";
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tweetId } = req.params;
      const likedUserId = req.currentUser?.id;

      const deletedLike = await Like.findOne({
        userId: likedUserId,
        tweetId,
      }).catch((err) => {
        console.error(err);
        throw new DBError(JSON.stringify(err));
      });

      if (deletedLike === null) {
        throw new ConflictError("like not exist");
      }

      // trigger hook to publish
      await deletedLike!.remove();

      res.status(204).send("ok");
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export { router as deleteLikeRouter };
