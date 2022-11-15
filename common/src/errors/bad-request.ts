import { CustomError } from "./custom-error";
import { ErrorResponse } from "./type-error";

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors(): ErrorResponse {
    return [{ message: this.message }];
  }
}
