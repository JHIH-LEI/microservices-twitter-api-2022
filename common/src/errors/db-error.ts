import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 500;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors() {
    return [{ message: `database error: ${this.message}` }];
  }
}
