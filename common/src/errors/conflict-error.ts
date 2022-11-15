import { CustomError } from "./custom-error";
import { ErrorResponse } from "./type-error";

export abstract class ConflictError extends CustomError {
  statusCode = 409;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  serializeErrors(): ErrorResponse {
    return [{ message: `conflict: ${this.message}` }];
  }
}
