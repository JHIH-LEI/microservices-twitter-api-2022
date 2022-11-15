import express, { NextFunction, Request, Response } from "express";
import {
  requireAuth,
  currentUser,
  ConflictError,
  DBError,
} from "@domosideproject/twitter-common";
import { db } from "../models/index";
const router = express.Router();

router.post(
  "/:followingId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const followerId = req.currentUser!.id;
      const followingId = req.params.followingId;

      if (followerId === followingId) {
        throw new ConflictError("can not follow yourself");
      }
      // 不能追蹤不存在的用戶
      const isExistUser = await db.User.findByPk(followerId).catch((error) => {
        throw new DBError(JSON.stringify(error));
      });

      if (isExistUser === null) {
        throw new ConflictError(
          `can not follow not existUser user: ${followingId}`
        );
      }
      // 如果event還來不及處理怎辦？

      try {
        await db.Followship.create({
          followerId,
          followingId,
        });
      } catch (error: any) {
        throw new DBError(JSON.stringify(error));
      }

      res.status(201).send("ok");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
export { router as followRouter };
