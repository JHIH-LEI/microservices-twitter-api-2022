import express, { Request, Response } from "express";
import { ImgurClient } from "imgur/lib/client";
const router = express.Router();
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { body } from "express-validator";
import {
  requireAuth,
  currentUser,
  // Forbidden,
} from "@domosideproject/twitter-common";
import { User, UserDoc } from "../models/user";
import { Password } from "../services/password";

router.put(
  "/:userId",
  [
    body("account")
      .trim()
      .isLength({ min: 4 })
      .withMessage("account must at least 4 characters"),
    body("password")
      .trim()
      .isLength({ min: 6, max: 50 })
      .withMessage("password must between 6~50 characters"),
  ],
  currentUser,
  requireAuth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { userId: targetUserId } = req.params;
      const loginUserId = req.currentUser!.id;

      if (targetUserId !== loginUserId) {
        // throw new Forbidden("can not modify other user file");
      }

      let client = new ImgurClient({ clientId: process.env.CLIENT_ID! });
      const { name, account, password, checkPassword, intro, email, banner } =
        req.body;

      const user = await User.findById(targetUserId);

      // TODO: throw 404 customized error
      if (user === null) {
        throw new Error("not exist");
      }

      const isNotMatchPassword = !(await Password.compare({
        storedPassword: user.password || "",
        suppliedPassword: password,
      }));

      if (password !== checkPassword || isNotMatchPassword) {
        //
      }
      // TODO:conflict error 確認account及email是否已被註冊

      if (email && email !== user.email) {
        const sameEmailUser = await User.findOne(email);
        if (sameEmailUser) throw new Error("409");
        user.email = email;
      }

      if (account && account !== user.account) {
        const sameAccountUser = await User.findOne(email);
        if (sameAccountUser) throw new Error("409");
        user.account = account;
      }

      if (banner === "delete") user.banner = "";

      if (!Array.isArray(req.files) && req.files) {
        const { avatar, banner } = await uploadImage({
          user,
          avatar: req.files.avatar,
          banner: req.files.banner,
          client,
        });
        user.avatar = avatar;
        user.banner = banner;
      }

      if (intro) {
        user.intro = intro;
      }

      if (name) {
        user.name = name;
      }

      await user.save();

      res.status(204).send(user);
    } catch (err) {
      console.error(err);
      // TODO: error
    }
  }
);

async function uploadImage({
  avatar,
  banner,
  client,
  user,
}: {
  avatar: any[];
  banner: any[];
  client: ImgurClient;
  user: UserDoc;
}) {
  const updatedTarget =
    avatar && banner
      ? "avatar & banner"
      : avatar && !banner
      ? "only avatar"
      : !avatar && banner
      ? "only banner"
      : "no update";

  const finalData = { avatar: user.avatar, banner: user.banner };

  switch (updatedTarget) {
    case "avatar & banner": {
      const images = await client.upload([
        {
          image: avatar[0].path,
          title: "avatar",
        },
        {
          image: banner[0].path,
          title: "banner",
        },
      ]);
      if (Array.isArray(images)) {
        finalData.avatar = images[0].data.link;
        finalData.banner = images[1].data.link;
      }
      break;
    }
    case "only avatar": {
      const imageURL = await client.upload(avatar[0].path);

      if (!Array.isArray(imageURL)) {
        finalData.avatar = imageURL.data.link;
      }
      break;
    }
    case "only banner": {
      const imageURL = await client.upload(banner[0].path);
      if (!Array.isArray(imageURL)) {
        finalData.banner = imageURL.data.link;
      }
      break;
    }
  }

  return finalData;
}

export { router as updateUserRouter };