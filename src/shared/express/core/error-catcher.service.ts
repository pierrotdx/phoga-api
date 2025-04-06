import { Handler, NextFunction, Request, Response } from "express";

export function wrapWithErrorCatcher(handler: Handler): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
