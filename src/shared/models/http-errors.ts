export enum HttpErrorCode {
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
    super(message);
  }
}
