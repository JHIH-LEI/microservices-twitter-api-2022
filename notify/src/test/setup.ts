import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { redis } from "../index";

jest.mock("../mongodbConfig");

let mongoServer: MongoMemoryServer;
declare global {
  var getToken: (id?: mongoose.Types.ObjectId) => string;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
    await mongoose.connection.close();
    await redis.flushall();
  }
});

global.getToken = (id?: mongoose.Types.ObjectId) => {
  id = id || new mongoose.Types.ObjectId();
  //  產生fake cookie而不是通過依賴另一個服務取得
  const payload = { id: id.toHexString() };
  // 創建JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  return token;
};
