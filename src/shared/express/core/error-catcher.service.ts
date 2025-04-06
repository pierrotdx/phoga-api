import { NextFunction, Request, Response } from "express";

import { RequestHandler } from "./models";

export function wrapWithErrorCatcher<T>(
  handler: RequestHandler<T>,
): RequestHandler<T> {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
