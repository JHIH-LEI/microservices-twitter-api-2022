import { Express } from "express";
import { likeRouter } from "./like";
import { replyRouter } from "./reply";
import { tweetRouter } from "./tweet";

export default (app: Express) => {
  app.use("/api/tweets", tweetRouter);
  app.use("/api/replies", replyRouter);
  app.use("/api/likes", likeRouter);
};
