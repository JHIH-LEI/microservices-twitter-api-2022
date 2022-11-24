import { ConflictError, DBError } from "@domosideproject/twitter-common";
import { NextFunction, Request, Response } from "express";
import { Tweet } from "../../models/tweet";
import { TweetUpdatedPublisher } from "../../publishers/tweet-updated";
import { connection } from "../../app";

export const updateTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tweetId } = req.params;
    const { description } = req.body;
    const loginUser = req.currentUser!.id;
    const updatedTweet = await Tweet.findOneAndUpdate(
      { userId: loginUser, _id: tweetId },
      { description }
    ).catch((err: any) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    if (updatedTweet === null) {
      throw new ConflictError(
        `can not update tweet: ${tweetId} by user: ${loginUser}. Error possible reasons: 1. can not find tweetId or 2.trying to update other user tweet.`
      );
    }

    // publish

    await new TweetUpdatedPublisher(connection).publish({
      id: updatedTweet.id.toString(),
      version: updatedTweet.version,
      description: updatedTweet.description,
      updatedAt: updatedTweet.updatedAt.toISOString(),
    });

    res.send("ok");
  } catch (err) {
    console.error(err);
    next(err);
  }
};
