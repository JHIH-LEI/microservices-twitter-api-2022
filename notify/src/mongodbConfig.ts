import mongoose from "mongoose";

export const setupMongoose = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("missing MONGO_URL env variable");
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("connected to mongodb");
};
