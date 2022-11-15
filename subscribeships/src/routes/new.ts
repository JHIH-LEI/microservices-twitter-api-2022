import express, { NextFunction, Request, Response } from "express";
import {
  requireAuth,
  currentUser,
  DBError,
  ConflictError,
} from "@domosideproject/twitter-common";
import { db } from "../models/index";
const router = express.Router();

router.post(
  "/:userId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscriberId = req.currentUser!.id;
      const subscribingId = req.params.userId;

      if (subscriberId === subscribingId) {
        throw new ConflictError("can not follow yourself");
      }
      // 不能追蹤不存在的用戶
      const isExistUser = await db.User.findByPk(subscriberId).catch((err) => {
        throw new DBError(JSON.stringify(err));
      });

      if (isExistUser === null) {
        throw new ConflictError(
          `can not follow not existUser user: ${subscribingId}`
        );
      }
      // 如果event還來不及處理怎辦？
      // 不可重複追蹤

      await db.Subscribeship.findOrCreate({
        where: { subscriberId, subscribingId },
      }).catch((err) => {
        throw new DBError(err);
      });

      res.status(201).send("ok");
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);
export { router as subscribeRouter };
