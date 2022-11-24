import { ErrorResponse } from "./type-error";

export abstract class CustomError extends Error {
  abstract statusCode: number;

  // 傳入message是要讓我們的Error object還有message屬性
  // throw new Error('message') 會將message log出來，我們需要這個好東東！
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): ErrorResponse;
}
