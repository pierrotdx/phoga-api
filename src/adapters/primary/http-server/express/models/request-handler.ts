import { NextFunction, Request, Response } from "express";

export type RequestHandler<T> = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => Promise<T>;
