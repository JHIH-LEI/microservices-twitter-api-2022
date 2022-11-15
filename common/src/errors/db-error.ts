import { CustomError } from "./custom-error";

export class DBError extends CustomError {
  statusCode = 500;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, DBError.prototype);
  }

  serializeErrors() {
    return [{ message: `database error: ${this.message}` }];
  }
}
