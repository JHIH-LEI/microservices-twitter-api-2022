import mongoose from "mongoose";
import { app } from "./app";

// make sure we load all need env variables
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("missing JWT_KEY env variable");
  }

  const MONGO_URI =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DB_URL
      : process.env.NODE_ENV === "prod"
      ? process.env.PROD_DB_URL
      : process.env.DEV_DB_URL;

  if (!MONGO_URI) {
    throw new Error("missing db url env variable");
  }

  await mongoose.connect(MONGO_URI);
  console.log("connected to mongodb");

  app.listen(3000, () => {
    console.log("listing on 3000!");
  });
};

start();
