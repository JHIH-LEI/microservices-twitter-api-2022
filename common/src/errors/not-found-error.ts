import { CustomError } from "./custom-error";
import { ErrorResponse } from "./type-error";

export abstract class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): ErrorResponse {
    return [{ message: this.message }];
  }
}
