import { CustomError } from "./custom-error";

export class ConflictError extends CustomError {
  statusCode = 409;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors() {
    return [{ message: `conflict: ${this.message}` }];
  }
}
