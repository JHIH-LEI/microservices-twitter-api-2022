import {
  ConflictError,
  currentUser,
  DBError,
  requireAuth,
  validateRequest,
} from "@domosideproject/twitter-common";
import express, { NextFunction, Request, Response } from "express";
import { Tweet } from "../models/tweet";
import { User } from "../models/user";
import { body } from "express-validator";
import { TweetCreatedPublisher } from "../publishers/tweet-created";
import { connection } from "../app";
const router = express.Router();

router.post(
  "/",
  currentUser,
  requireAuth,
  [body("description").trim().not().isEmpty().isLength({ max: 140 })],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
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

      await new TweetCreatedPublisher(connection).publish({
        id: tweet.id,
        description: tweet.description,
        userId: tweet.userId.toString(),
        name: creator.name,
        avatar: creator.avatar,
        version: tweet.version,
        createdAt: tweet.createdAt.toISOString(),
        updatedAt: tweet.updatedAt.toISOString(),
      });

      res.status(201).send(tweet._id);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export { router as newTweetRouter };
