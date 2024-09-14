import { EntryPointId, entryPoints } from "@http-server";

import { IExpressAuthHandler } from "../../models";
import { ExpressRouter } from "../express-router";
import { AdminPhotoRouter } from "./admin-photo.router";

export class AdminRouter extends ExpressRouter {
  constructor(
    private readonly adminPhotoRouter: AdminPhotoRouter,
    private readonly authHandler: IExpressAuthHandler,
  ) {
    super();
    this.router.use(this.authHandler.requiresAuth);
    this.addAdminPhotoBaseRouter();
  }

  private addAdminPhotoBaseRouter() {
    const path = entryPoints.getRelativePath(EntryPointId.AdminPhotoBase);
    this.addSubRouter(this.adminPhotoRouter, path);
  }
}
