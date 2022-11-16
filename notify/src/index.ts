import { server } from "./server";
import mongoose from "mongoose";
import { getDBUrlBaseNodeEnv } from "@domosideproject/twitter-common";

const start = async () => {
  const MONGO_URI = getDBUrlBaseNodeEnv();
  if (!MONGO_URI) {
    throw new Error("missing db url env variable");
  }

  await mongoose.connect(MONGO_URI);
  console.log("connected to mongodb");

  server.listen(3000, () => {
    console.log("notify socket server listening on 3000");
  });
};

start();
