import {
  requireAuth,
  currentUser,
  DBError,
} from "@domosideproject/twitter-common";
import express, { NextFunction, Request, Response } from "express";
import { db } from "../models/index";
const router = express.Router();

router.delete(
  "/:followingId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const followerId = req.currentUser!.id;
      const followingId = req.params.followingId;

      await db.Followship.destroy({
        where: { followingId, followerId },
        individualHooks: true,
      }).catch((err) => {
        throw new DBError(`db error: ${JSON.stringify(err)}`);
      });

      res.status(204).send("ok");
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export { router as unFollowRouter };
