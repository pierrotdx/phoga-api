import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { IExpressRouter } from "../models";
import { AdminRouter } from "./admin";
import { PhotoRouter } from "./photo.router";

export class AppRouter implements IExpressRouter {
  router: Router;

  constructor(
    private readonly photoRouter: PhotoRouter,
    private readonly adminRouter: AdminRouter,
  ) {
    this.router = Router();
    this.setBaseRoute();
    this.addSubRouter(EntryPointId.PhotoBase, this.photoRouter);
    this.addSubRouter(EntryPointId.AdminBase, this.adminRouter);
  }

  getRouter(): Router {
    return this.router;
  }

  private setBaseRoute() {
    const basePath = entryPoints.getRelativePath(EntryPointId.Base);
    this.router.get(basePath, (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
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
