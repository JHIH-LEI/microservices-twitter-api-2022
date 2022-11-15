import {
  requireAuth,
  currentUser,
  DBError,
} from "@domosideproject/twitter-common";
import express, { NextFunction, Request, Response } from "express";
import { db } from "../models/index";
const router = express.Router();

router.delete(
  "/:userId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscriberId = req.currentUser!.id;
      const subscribingId = req.params.userId;

      await db.Subscribeship.destroy({
        where: { subscribingId, subscriberId },
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

export { router as unSubscribeRouter };
