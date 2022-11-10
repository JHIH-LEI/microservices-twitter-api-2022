import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { Types } from "mongoose";
import { param, body } from "express-validator";
import { Reply } from "../models/reply";
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

    await reply.save().catch((err) => {
      console.error(err);
      throw new DBError(JSON.stringify(err));
    });

    res
      .status(201)
      .send({
        id: reply._id,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      });
  }
);

export { router as newReplyRouter };
