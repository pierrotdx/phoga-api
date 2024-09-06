import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { IExpressRouter } from "../../models";
import { AdminPhotoRouter } from "./admin-photo.router";

export class AdminRouter implements IExpressRouter {
  private readonly router: Router;

  constructor(private readonly adminPhotoRouter: AdminPhotoRouter) {
    this.router = Router();
    this.addSubRouter(EntryPointId.AdminPhotoBase, this.adminPhotoRouter);
  }

  getRouter(): Router {
    return this.router;
  }

  private addSubRouter(
    entryPointId: EntryPointId,
    expressRouter: IExpressRouter,
  ) {
    const path = entryPoints.getRelativePath(entryPointId);
    const router = expressRouter.getRouter();
    this.router.use(path, router);
  }
}
