import { IAuthHandler } from "@auth-context";
import { PhotoEntryPointId, PhotoRouter, entryPoints } from "@photo-context";
import { ExpressRouter } from "@shared/express";

import { AdminRouter } from "./admin.router";

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
    const basePath = entryPoints.getRelativePath(PhotoEntryPointId.Base);
    this.router.get(basePath, (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
  }

  private addPhotoRouter() {
    const path = entryPoints.getRelativePath(PhotoEntryPointId.PhotoBase);
    this.addSubRouter(this.photoRouter, path);
  }

  private addAdminRouter() {
    const path = entryPoints.getRelativePath(PhotoEntryPointId.AdminBase);
    this.addSubRouter(this.adminRouter, path, this.authHandler.requiresAuth);
  }
}
