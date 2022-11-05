import jwt from "jsonwebtoken";
import { Request } from "express";

function jwtSign(payload: { [k: string]: any }, req: Request) {
  const userJwt = jwt.sign(payload, process.env.JWT_KEY!);

  req.session = {
    jwt: userJwt,
  };
}

export { jwtSign };
