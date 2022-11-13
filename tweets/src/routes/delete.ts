import {
  DBError,
  currentUser,
  requireAuth,
  ConflictError,
  validateRequest,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { Tweet } from "../models/tweet";
import { param } from "express-validator";
import { Types } from "mongoose";
import { TweetDeletedPublisher } from "../publishers/tweet-deleted";
import { connection } from "../app";
const router = express.Router();

router.delete(
  "/:tweetId",
  currentUser,
  requireAuth,
  [param("tweetId").custom((id) => Types.ObjectId.isValid(id))],
  validateRequest,
  async (req: Request, res: Response) => {
    const { tweetId } = req.params;
    const loginUser = req.currentUser!.id;

    const deletedTweet = await Tweet.findOneAndDelete({
      userId: loginUser,
      _id: tweetId,
    }).catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    if (deletedTweet === null) {
      throw new ConflictError(
        `can not delete tweet: ${tweetId} by user: ${loginUser}. Error possible reasons: 1. can not find tweetId or 2.trying to delete other user tweet.`
      );
    }

    await new TweetDeletedPublisher(connection).publish({
      id: deletedTweet.id,
      version: deletedTweet.version,
    });

    res.status(204).send("ok");
  }
);

export { router as deleteTweetRouter };
