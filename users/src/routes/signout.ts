import express, { Request, Response } from "express";

const router = express.Router();

router.post("/signout", async (req: Request, res: Response) => {
  req.session = null;
  res.send("ok");
});

export { router as signoutUserRouter };
