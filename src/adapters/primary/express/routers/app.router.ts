import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { IExpressRouter } from "../models";
import { addSubRouter } from "../services";
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
    addSubRouter(this.router, this.photoRouter, EntryPointId.PhotoBase);
    addSubRouter(this.router, this.adminRouter, EntryPointId.AdminBase);
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
}
