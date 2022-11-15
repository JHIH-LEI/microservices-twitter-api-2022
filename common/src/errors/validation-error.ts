import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";
import { ErrorResponse } from "./type-error";

export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super("request validation error");

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors(): ErrorResponse {
    return this.errors.map((err) => ({ message: err.msg, field: err.param }));
  }
}
