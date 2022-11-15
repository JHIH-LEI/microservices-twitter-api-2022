import { CustomError } from "./custom-error";
import { ErrorResponse } from "./type-error";

export class Forbidden extends CustomError {
  statusCode: number = 403;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, Forbidden.prototype);
  }
  serializeErrors(): ErrorResponse {
    return [{ message: this.message }];
  }
}
