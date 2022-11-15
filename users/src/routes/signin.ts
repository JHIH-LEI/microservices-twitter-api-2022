import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { Password } from "../services/password";
import {
  jwtSign,
  BadRequestError,
  validateRequest,
} from "@domosideproject/twitter-common";
const router = express.Router();

router.post(
  "/signin",
  [
    body("account")
      .trim()
      .isString()
      .isLength({ min: 6, max: 50 })
      .withMessage("account must at least 4 characters"),
    body("password")
      .trim()
      .isString()
      .isLength({ min: 6, max: 50 })
      .withMessage("password must between 6~50 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account, password } = req.body;
      const existingUser = await User.findOne({ account });

      if (!existingUser) {
        throw new BadRequestError("invalid credentials");
      }

      const passwordMatch = await Password.compare({
        suppliedPassword: password,
        storedPassword: existingUser.password,
      });

      if (!passwordMatch) {
        throw new BadRequestError("invalid credentials");
      }

      jwtSign({ id: existingUser.id, email: existingUser.email }, req);

      res.send(existingUser);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export { router as signinUserRouter };
