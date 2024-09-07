import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { IExpressRouter } from "../models";

export function addSubRouter(
  baseRouter: Router,
  expressSubRouter: IExpressRouter,
  entryPointId: EntryPointId,
) {
  const path = entryPoints.getRelativePath(entryPointId);
  const subRouter = expressSubRouter.getRouter();
  baseRouter.use(path, subRouter);
}
