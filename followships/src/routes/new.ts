import express, { Request, Response } from "express";
import { requireAuth, currentUser } from "@domosideproject/twitter-common";
import { db } from "../models/index";
const { User, Followship } = db;
const router = express.Router();

router.post(
  "/:followingId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const followerId = req.currentUser!.id;
    const followingId = req.params.followingId;
    // TODO: conflict
    if (followerId === followingId) {
      throw new Error("can not follow yourself");
    }
    // 不能追蹤不存在的用戶
    const isExistUser = await User.findByPk(followerId);

    // TODO: throw custom error
    if (isExistUser === null) {
      throw new Error(`can not follow not existUser user: ${followingId}`);
    }
    // 如果event還來不及處理怎辦？
    // 不可重複追蹤

    // TODO: db error

    await Followship.findOrCreate({
      where: { followerId: followingId, followingId },
    });
    res.status(201).send("ok");
  }
);
export { router as followRouter };
