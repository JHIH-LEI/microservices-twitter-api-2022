import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import jsonwebtoken from "jsonwebtoken";
import { validateRequest } from "@domosideproject/twitter-common";
const router = express.Router();

type PostUserRequest = {
  name: string;
  account: string;
  email: string;
  password: string;
  checkPassword: string;
};
// TODO: requestValidate middleware
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

    // TODO: 密碼相符
    if (password !== checkPassword) {
      //
    }

    const user = User.build({ name, email, password, account });
    try {
      await user.save();
    } catch (err) {
      // TODO: DB ERROR
    }

    const userJWT = jsonwebtoken.sign({ id: user.id }, process.env.JWT_KEY!);
    // store in cookie
    req.session = {
      jwt: userJWT,
    };
    res.status(201).send(user);
  }
);

export { router as newUserRouter };
