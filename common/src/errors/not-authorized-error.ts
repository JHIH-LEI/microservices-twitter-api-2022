import { CustomError } from "./custom-error";
import { ErrorResponse } from "./type-error";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  constructor() {
    super("Not authorized");

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors(): ErrorResponse {
    return [{ message: "Not authorized" }];
  }
}
