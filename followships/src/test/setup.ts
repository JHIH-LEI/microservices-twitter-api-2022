import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config({ path: `${process.cwd()}/src/.env` });
process.env.NODE_ENV = "test";

declare global {
  var getCookie: (id?: number) => string[];
}
import { db } from "../models/index";
const { User, Followship, sequelize } = db;

if (!sequelize) {
  throw new Error("have to connect to db");
}

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(async () => {
  // 刪除資料
  try {
    await Followship.destroy({ where: {} });
    await User.destroy({ where: {} });
  } catch (err) {
    console.log(err);
  }
});

afterEach(async () => {
  // 刪除資料
  try {
    await Followship.destroy({ where: {} });
    await User.destroy({ where: {} });
  } catch (err) {
    console.log(err);
  }
});

afterAll(async () => {
  await sequelize.close();
});

global.getCookie = (id?: number) => {
  id = id || 1;
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
