import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import jsonwebtoken from "jsonwebtoken";
import {
  BadRequestError,
  DBError,
  UserCreatedContent,
  validateRequest,
} from "@domosideproject/twitter-common";
import { UserCreatedPublisher } from "../publishers/user-created";
import { connection } from "../app";
const router = express.Router();

type PostUserRequest = {
  name: string;
  account: string;
  email: string;
  password: string;
  checkPassword: string;
};

router.post(
  "/",
  [
    body("name").not().isEmpty().trim(),
    body("email").isEmail().withMessage("Email must valid"),
    body("account")
      .trim()
      .isLength({ min: 4 })
      .withMessage("account must at least 4 characters"),
    body("password")
      .trim()
      .isLength({ min: 6, max: 50 })
      .withMessage("password must between 6~50 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, email, account, password, checkPassword } =
      req.body as PostUserRequest;

    if (password !== checkPassword) {
      throw new BadRequestError("password should match with checkPassword");
    }

    const user = User.build({ name, email, password, account });
    try {
      await user.save();
    } catch (err: any) {
      throw new DBError(`DB error: ${err}`);
    }

    const userJWT = jsonwebtoken.sign({ id: user.id }, process.env.JWT_KEY!);
    // store in cookie
    req.session = {
      jwt: userJWT,
    };

    await new UserCreatedPublisher(connection).publish({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      account: user.account,
      version: user.version,
    });
    res.status(201).send(user);
  }
);

export { router as newUserRouter };
