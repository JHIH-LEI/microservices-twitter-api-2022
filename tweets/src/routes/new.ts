import {
  ConflictError,
  currentUser,
  DBError,
  requireAuth,
  validateRequest,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { Tweet } from "../models/tweet";
import { User } from "../models/user";
import { body } from "express-validator";
const router = express.Router();

router.post(
  "/",
  currentUser,
  requireAuth,
  [body("description").trim().not().isEmpty().isLength({ max: 140 })],
  validateRequest,
  async (req: Request, res: Response) => {
    const { description } = req.body as { description: string };

    const creator = await User.findById(req.currentUser!.id);

    if (creator === null) {
      throw new ConflictError(
        `can not find login user :${req.currentUser!.id} in database`
      );
    }

    const tweet = await Tweet.create({ description, userId: creator.id }).catch(
      (err) => {
        console.error(err);
        // TODO: DB ERROR
        throw new Error(JSON.stringify(err));
      }
    );

    res.status(201).send(tweet._id);
  }
);

export { router as newTweetRouter };
