import {
  requireAuth,
  currentUser,
  DBError,
} from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { db } from "../models/index";
const router = express.Router();

router.delete(
  "/:userId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const subscriberId = req.currentUser!.id;
    const subscribingId = req.params.userId;

    try {
      await db.Subscribeship.destroy({
        where: { subscribingId, subscriberId },
        individualHooks: true,
      });
    } catch (err) {
      console.error(err);
      throw new DBError(`db error: ${JSON.stringify(err)}`);
    }
    res.status(204).send("ok");
  }
);

export { router as unSubscribeRouter };
