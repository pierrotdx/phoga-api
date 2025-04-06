import { IAuthHandler } from "@auth-context";
import {
  AdminPhotoRouter,
  PhotoEntryPointId,
  entryPoints,
} from "@photo-context";
import { ExpressRouter } from "@shared/express";

export class AdminRouter extends ExpressRouter {
  constructor(
    private readonly adminPhotoRouter: AdminPhotoRouter,
    private readonly authHandler: IAuthHandler,
  ) {
    super();
    this.router.use(this.authHandler.requiresAuth);
    this.addAdminPhotoBaseRouter();
  }

  private addAdminPhotoBaseRouter() {
    const path = entryPoints.getRelativePath(PhotoEntryPointId.AdminPhotoBase);
    this.addSubRouter(this.adminPhotoRouter, path);
  }
}
