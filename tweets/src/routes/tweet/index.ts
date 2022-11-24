import {
  currentUser,
  requireAuth,
  validateRequest,
} from "@domosideproject/twitter-common";
import express from "express";
import { body, param } from "express-validator";
import { Types } from "mongoose";
import { getTweetReplies } from "./getTweetReplies";
import { getAllTweets } from "./all";
import { deleteTweet } from "./delete";
import { newTweet } from "./new";
import { showTweet } from "./show";
import { updateTweet } from "./update";
const router = express.Router();

// TODO: 只要有x prams 就要驗證

router.get(
  "/:tweetId/replies",
  currentUser,
  requireAuth,
  [
    param("tweetId")
      .custom((id) => Types.ObjectId.isValid(id))
      .withMessage("tweetId is not valid."),
  ],
  validateRequest,
  getTweetReplies
);

router
  .route("/:tweetId")
  .get(
    currentUser,
    requireAuth,
    [param("tweetId").custom((id) => Types.ObjectId.isValid(id))],
    validateRequest,
    showTweet
  )
  .put(
    currentUser,
    requireAuth,
    [
      body("description").trim().not().isEmpty().isLength({ max: 140 }),
      param("tweetId").custom((id) => Types.ObjectId.isValid(id)),
    ],
    validateRequest,
    updateTweet
  )
  .delete(
    currentUser,
    requireAuth,
    [param("tweetId").custom((id) => Types.ObjectId.isValid(id))],
    validateRequest,
    deleteTweet
  );

router
  .route("/")
  .get(currentUser, requireAuth, getAllTweets)
  .post(
    currentUser,
    requireAuth,
    [body("description").trim().not().isEmpty().isLength({ max: 140 })],
    validateRequest,
    newTweet
  );

export { router as tweetRouter };
