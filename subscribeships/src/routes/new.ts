import express, { Request, Response } from "express";
import { requireAuth, currentUser } from "@domosideproject/twitter-common";
import { db } from "../models/index";
const { User, Subscribeship } = db;
const router = express.Router();

router.post(
  "/:userId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const subscriberId = req.currentUser!.id;
    const subscribingId = req.params.userId;
    // TODO: conflict
    if (subscriberId === subscribingId) {
      throw new Error("can not follow yourself");
    }
    // 不能追蹤不存在的用戶
    const isExistUser = await User.findByPk(subscriberId);

    // TODO: throw custom error
    if (isExistUser === null) {
      throw new Error(`can not follow not existUser user: ${subscribingId}`);
    }
    // 如果event還來不及處理怎辦？
    // 不可重複追蹤

    // TODO: db error

    try {
      await Subscribeship.findOrCreate({
        where: { subscriberId: subscribingId, subscribingId },
      });
    } catch (err: any) {
      console.error(err);
      throw new Error(err);
    }
    res.status(201).send("ok");
  }
);
export { router as subscribeRouter };
