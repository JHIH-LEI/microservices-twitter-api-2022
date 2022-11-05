import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  try {
    // make sure we load all need env variables
    if (!process.env.JWT_KEY) {
      throw new Error("missing JWT_KEY env variable");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("missing MONGO_URI env variable");
    }

    await mongoose.connect(process.env.MONGO_URI!);
    console.log("connected to mongodb");

    app.listen(3000, () => {
      console.log("listing on 3000!");
    });
  } catch (error) {
    console.error(error);
  }
};

start();
