import { Request, Response, NextFunction } from "express";
import { CustomError } from "./custom-error";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .send({ errors: error.serializeErrors() });
  }

  console.log(error);
  const errorRes = [{ message: "sth went wrong" }];

  res.status(400).send(errorRes);
};
