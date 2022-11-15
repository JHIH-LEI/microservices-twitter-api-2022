import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var getCookie: (id?: string) => string[];
}

let mongoServer: MongoMemoryServer;

jest.mock("../publishers/user-created.ts");

beforeAll(async () => {
  process.env.JWT_KEY = "domw";
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
    await mongoose.connection.close();
  }
});

global.getCookie = (id?: string) => {
  id = id || new mongoose.Types.ObjectId().toHexString();
  //  產生fake cookie而不是通過依賴另一個服務取得
  // 創建jwt payload {id, email}
  const payload = { id: id, email: "test@test.com" };
  // 創建JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object {jwt: MY_JWT}
  const session = { jwt: token };
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const sessionBase64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with the encoded data
  return [`session=${sessionBase64}`];
};
