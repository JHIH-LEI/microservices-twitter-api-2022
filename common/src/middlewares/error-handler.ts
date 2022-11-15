import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";

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

  console.log("error:", error);
  const errorRes = [{ message: `sth went wrong: ${JSON.stringify(error)}` }];

  res.status(400).send(errorRes);
};
