import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { getUserLikedTweetsRouter } from "./routes/getUserLikedTweets";
import { newLikeRouter } from "./routes/new";
import { errorHandler, NotFoundError } from "@domosideproject/twitter-common";
import { deleteLikeRouter } from "./routes/delete";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // cookie內容不需加密，因為jwt已經加密了
    secure: process.env.NODE_ENV !== "test", // https才會set-cookie(如果有在req.session物件放東西)
  })
);

app.use("/api/likes", getUserLikedTweetsRouter);
app.use("/api/likes", newLikeRouter);
app.use("/api/likes", deleteLikeRouter);

app.all("*", () => {
  throw new NotFoundError("can not find route");
});

app.use(errorHandler);
export { app };
