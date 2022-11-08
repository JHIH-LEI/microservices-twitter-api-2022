import { requireAuth, currentUser } from "@domosideproject/twitter-common";
import express, { Request, Response } from "express";
import { db } from "../models/index";
const { Subscribeship } = db;
const router = express.Router();

router.delete(
  "/:userId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const subscriberId = req.currentUser!.id;
    const subscribingId = req.params.userId;

    try {
      await Subscribeship.destroy({ where: { subscribingId, subscriberId } });
    } catch (err) {
      // TODO: db error
      console.error(err);
      throw new Error(`db error: ${JSON.stringify(err)}`);
    }
    res.status(204).send("ok");
  }
);

export { router as unSubscribeRouter };
