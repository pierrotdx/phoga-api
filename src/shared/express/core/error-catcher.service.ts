import { HttpErrorCode } from "#shared/models";
import { Handler, NextFunction, Request, Response } from "express";

export function wrapWithErrorCatcher(handler: Handler): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await handler(req, res, next);
    } catch (err) {
      setResponseStatusCode(res, err);
      next(err);
    }
  };
}

function setResponseStatusCode(res: Response, err: any): void {
  const errorCode = err.status;
  if (!errorCode) {
    return;
  }
  const isHttpError = Object.values(HttpErrorCode).includes(errorCode);
  if (!isHttpError) {
    return;
  }
  res.sendStatus(errorCode);
}
