import { Router } from "express";

import { IAuthHandler } from "@auth-context";
import {
  AdminPhotoRouter,
  IPhotoImageDb,
  IPhotoMetadataDb,
} from "@photo-context";
import { BaseEntryPoints, BaseEntryPointsId } from "@shared/entry-points";
import { IExpressRouter } from "@shared/express";

export class AdminRouter implements IExpressRouter {
  private readonly router = Router();

  private readonly entryPoints = new BaseEntryPoints();

  constructor(
    private readonly authHandler: IAuthHandler,
    private readonly metadataDb: IPhotoMetadataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    this.restrictRouterAccessToAuthUsers();
    this.addAdminPhotoRouter();
  }

  private restrictRouterAccessToAuthUsers(): void {
    this.router.use(this.authHandler.requiresAuth);
  }

  private addAdminPhotoRouter() {
    const path = this.entryPoints.getRelativePath(
      BaseEntryPointsId.AdminPhotoBase,
    );
    const adminPhotoRouter = new AdminPhotoRouter(
      this.authHandler,
      this.metadataDb,
      this.imageDb,
    ).get();
    this.router.use(path, adminPhotoRouter);
  }

  get(): Router {
    return this.router;
  }
}
