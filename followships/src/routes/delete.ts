import {
  requireAuth,
  currentUser,
  DBError,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { db } from "../models/index";
const { Followship } = db;
const router = express.Router();

router.delete(
  "/:followingId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const followerId = req.currentUser!.id;
    const followingId = req.params.followingId;

    try {
      await Followship.destroy({ where: { followingId, followerId } });
    } catch (err) {
      console.error(err);
      throw new DBError(`db error: ${JSON.stringify(err)}`);
    }
    res.status(204).send("ok");
  }
);

export { router as unFollowRouter };
