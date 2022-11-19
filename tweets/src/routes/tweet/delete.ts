import { DBError, ConflictError } from "@domosideproject/twitter-common";
import { NextFunction, Request, Response } from "express";
import { Tweet } from "../../models/tweet";
import { TweetDeletedPublisher } from "../../publishers/tweet-deleted";
import { connection } from "../../app";
export const deleteTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tweetId } = req.params;
    const loginUser = req.currentUser!.id;

    const deletedTweet = await Tweet.findOneAndDelete({
      userId: loginUser,
      _id: tweetId,
    }).catch((err: any) => {
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
  } catch (err) {
    console.error(err);
    next(err);
  }
};
