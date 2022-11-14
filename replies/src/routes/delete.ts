import express, { Request, Response } from "express";
const router = express.Router();
import {
  currentUser,
  requireAuth,
  DBError,
  validateRequest,
  ConflictError,
} from "@domosideproject/twitter-common";
import { Reply } from "../models/reply";
import { param } from "express-validator";
import { Types } from "mongoose";

router.delete(
  "/:replyId",
  currentUser,
  requireAuth,
  [
    param("replyId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("replyId is not valid."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { replyId } = req.params;
    const loginUserId = req.currentUser?.id;

    const reply = await Reply.findOne({ userId: loginUserId, replyId }).catch(
      (err) => {
        console.error(err);
        throw new DBError(JSON.stringify(err));
      }
    );

    if (reply === null) {
      throw new ConflictError("reply not exist");
    }

    await reply.remove();
    res.status(204).send("ok");
  }
);

export { router as deleteReplyRouter };
