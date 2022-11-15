import express, { Request, Response } from "express";
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
  async (req: Request, res: Response) => {
    const followerId = req.currentUser!.id;
    const followingId = req.params.followingId;

    if (followerId === followingId) {
      throw new ConflictError("can not follow yourself");
    }
    // 不能追蹤不存在的用戶
    const isExistUser = await db.User.findByPk(followerId);

    // TODO: throw custom error
    if (isExistUser === null) {
      throw new ConflictError(
        `can not follow not existUser user: ${followingId}`
      );
    }
    // 如果event還來不及處理怎辦？
    // 不可重複追蹤

    try {
      await db.Followship.findOrCreate({
        where: { followerId: followingId, followingId },
      });
    } catch (error: any) {
      console.error(error);
      throw new DBError(error);
    }

    res.status(201).send("ok");
  }
);
export { router as followRouter };
