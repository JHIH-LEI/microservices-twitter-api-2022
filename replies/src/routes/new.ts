import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
  ReplyCreatedContent,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { Types } from "mongoose";
import { param, body } from "express-validator";
import { Reply } from "../models/reply";
import { ReplyCreatedPublisher } from "../publishers/reply-created";
import { connection } from "../app";
import { User } from "../models/user";
const router = express.Router();

type CreateReplyFromRequest = {
  comment: string;
};

router.post(
  "/:tweetId",
  currentUser,
  requireAuth,
  [
    param("tweetId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("tweetId is not valid."),
    body("comment")
      .trim()
      .not()
      .isEmpty()
      .withMessage("comment can not be empty"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { tweetId } = req.params;
    const userId = req.currentUser!.id;
    const { comment } = req.body as CreateReplyFromRequest;

    const reply = Reply.build({ tweetId, userId, comment });

    const [user] = await Promise.all([
      User.findById(userId),
      reply.save(),
    ]).catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    const content: ReplyCreatedContent = {
      id: reply.id,
      comment: reply.comment,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      version: reply.version,
      tweetId: reply.tweetId.toHexString(),
      userId,
      avatar: user!.avatar,
    };

    await new ReplyCreatedPublisher(connection).publish(content);

    res.status(201).send({
      id: reply._id,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    });
  }
);

export { router as newReplyRouter };
