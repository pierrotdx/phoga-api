import { NextFunction, Request, Response } from "express";

export const issuerPort = 8080;
export const issuerHost = "0.0.0.0";
export const audience = "dumb-audience";
export const baseRoute = "/";
export const restrictedRoute = "/restricted";

export function dumbReqHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(200).json("dumb handler response");
}
