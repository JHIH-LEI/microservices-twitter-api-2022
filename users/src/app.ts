import { json } from "body-parser";
import express from "express";
import cookieSession from "cookie-session";
import { newUserRouter } from "./routes/new";
const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false, // cookie內容不需加密，因為jwt已經加密了
    secure: process.env.NODE_ENV !== "test", // https才會set-cookie(如果有在req.session物件放東西)
  })
);

app.use("/api/users", newUserRouter);

export { app };
