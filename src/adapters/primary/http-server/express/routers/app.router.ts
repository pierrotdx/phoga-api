import { EntryPointId, entryPoints } from "@http-server";

import { IAuthHandler } from "../models";
import { AdminRouter } from "./admin";
import { ExpressRouter } from "./express-router";
import { PhotoRouter } from "./photo.router";

export class AppRouter extends ExpressRouter {
  constructor(
    private readonly photoRouter: PhotoRouter,
    private readonly adminRouter: AdminRouter,
    private readonly authHandler: IAuthHandler,
  ) {
    super();
    this.setBaseRoute();
    this.addPhotoRouter();
    this.addAdminRouter();
  }

  private setBaseRoute() {
    const basePath = entryPoints.getRelativePath(EntryPointId.Base);
    this.router.get(basePath, (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
  }

  private addPhotoRouter() {
    const path = entryPoints.getRelativePath(EntryPointId.PhotoBase);
    this.addSubRouter(this.photoRouter, path);
  }

  private addAdminRouter() {
    const path = entryPoints.getRelativePath(EntryPointId.AdminBase);
    this.addSubRouter(this.adminRouter, path, this.authHandler.requiresAuth);
  }
}
