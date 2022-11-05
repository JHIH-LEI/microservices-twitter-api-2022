import express, { Request, Response } from "express";
import { currentUser } from "@domosideproject/twitter-common";
const router = express.Router();

router.get("/current", currentUser, async (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
