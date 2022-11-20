import {
  ConflictError,
  DBError,
  TweetCreatedContent,
} from "@domosideproject/twitter-common";
import { NextFunction, Request, Response } from "express";
import { Tweet } from "../../models/tweet";
import { User } from "../../models/user";
import { TweetCreatedPublisher } from "../../publishers/tweet-created";
import { connection } from "../../app";

export const newTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { description } = req.body as { description: string };

    const creator = await User.findById(req.currentUser!.id);

    if (creator === null) {
      throw new ConflictError(
        `can not find login user :${req.currentUser!.id} in database`
      );
    }

    const tweet = await Tweet.create({
      description,
      userId: creator.id,
    }).catch((err) => {
      throw new DBError(JSON.stringify(err));
    });

    const publishContent: TweetCreatedContent = {
      id: tweet.id.toString(),
      description: tweet.description,
      userId: tweet.userId.toString(),
      version: tweet.version,
      createdAt: tweet.createdAt.toISOString(),
      updatedAt: tweet.updatedAt.toISOString(),
    };

    await new TweetCreatedPublisher(connection).publish(publishContent);

    res.status(201).send(tweet._id);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
