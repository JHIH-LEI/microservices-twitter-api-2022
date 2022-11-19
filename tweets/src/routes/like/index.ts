import {
  currentUser,
  requireAuth,
  validateRequest,
} from "@domosideproject/twitter-common";
import express from "express";
import { param } from "express-validator";
import { Types } from "mongoose";
import { unLike } from "./delete";
import { getUserLikedTweets } from "./getUserLikedTweets";
import { newLike } from "./new";
const router = express.Router();

router.get(
  "/:userId",
  currentUser,
  requireAuth,
  [
    param("userId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("userId is not valid."),
  ],
  validateRequest,
  getUserLikedTweets
);

router
  .route("/:tweetId")
  .delete(
    currentUser,
    requireAuth,
    [
      param("tweetId")
        .custom((id) => Types.ObjectId.isValid(id))
        .withMessage("tweetId is not valid."),
    ],
    validateRequest,
    unLike
  )
  .post(
    currentUser,
    requireAuth,
    [
      param("tweetId")
        .custom((id) => Types.ObjectId.isValid(id))
        .withMessage("tweetId is not valid."),
    ],
    validateRequest,
    newLike
  );

export { router as likeRouter };
