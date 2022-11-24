import {
  currentUser,
  requireAuth,
  validateRequest,
} from "@domosideproject/twitter-common";
import express from "express";
import { body, param } from "express-validator";
import { Types } from "mongoose";
import { deleteReply } from "./delete";
import { getTweetReplies } from "../tweet/getTweetReplies";
import { getUserReplies } from "./getUserReplies";
import { newReply } from "./new";
const router = express.Router();

router.get(
  "/users/:userId",
  currentUser,
  requireAuth,
  [
    param("userId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("userId is not valid."),
  ],
  validateRequest,
  getUserReplies
);

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
  newReply
);

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
  deleteReply
);

export { router as replyRouter };
