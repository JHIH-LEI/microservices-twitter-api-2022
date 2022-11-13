import mongoose from "mongoose";
import { app } from "./app";
import { getDBUrlBaseNodeEnv } from "@domosideproject/twitter-common";

const start = async () => {
  try {
    const mongodbURI = getDBUrlBaseNodeEnv();
    // make sure we load all need env variables
    if (!process.env.JWT_KEY) {
      throw new Error("missing JWT_KEY env variable");
    }

    if (!mongodbURI) {
      throw new Error("missing mongodb uri plz check env variable");
    }

    await mongoose.connect(mongodbURI);
    console.log("connected to mongodb");

    app.listen(3000, () => {
      console.log("listing on 3000!");
    });
  } catch (error) {
    console.error(error);
  }
};

start();
