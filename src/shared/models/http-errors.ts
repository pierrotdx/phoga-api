export enum HttpErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  Conflict = 409,
  InternalServerError = 500,
}

export class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    const stringMessage = typeof message === "string" ? message : JSON.stringify(message);
    super(stringMessage);
  }
}
