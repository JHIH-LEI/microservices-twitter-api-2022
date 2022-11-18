import { getDBUrlBaseNodeEnv } from "@domosideproject/twitter-common";
import mongoose from "mongoose";

export const setupMongoose = async () => {
  const MONGO_URI = getDBUrlBaseNodeEnv();
  if (!MONGO_URI) {
    throw new Error("missing db url env variable");
  }

  await mongoose.connect(MONGO_URI);
  console.log("connected to mongodb");
};
