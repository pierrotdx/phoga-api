import { IAuthHandler } from "#auth-context";
import { IPhotoImageDb, IPhotoMetadataDb, PhotoRouter } from "#photo-context";
import { BaseEntryPoints, BaseEntryPointsId } from "#shared/entry-points";
import { IExpressRouter } from "#shared/express";
import { Router } from "express";

import { AdminRouter } from "./admin.router";

export class AppRouter implements IExpressRouter {
  private readonly router = Router();
  private readonly entryPoints = new BaseEntryPoints();

  constructor(
    private readonly authHandler: IAuthHandler,
    private readonly metadataDb: IPhotoMetadataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    this.setBaseRoute();
    this.addPhotoRouter();
    this.addAdminRouter();
  }

  private setBaseRoute() {
    const path = this.getPath(BaseEntryPointsId.Base);
    this.router.get(path, (req, res) => {
      res.send("Welcome to PHOGA API!");
    });
  }

  private getPath(entryPoint: BaseEntryPointsId): string {
    return this.entryPoints.getRelativePath(entryPoint);
  }

  private addPhotoRouter() {
    const path = this.getPath(BaseEntryPointsId.PhotoBase);
    const photoRouter = new PhotoRouter(this.metadataDb, this.imageDb).get();
    this.router.use(path, photoRouter);
  }

  private addAdminRouter() {
    const path = this.getPath(BaseEntryPointsId.AdminBase);
    const adminRouter = new AdminRouter(
      this.authHandler,
      this.metadataDb,
      this.imageDb,
    ).get();
    const permissionHandler = this.authHandler.requiresAuth;
    this.router.use(path, permissionHandler, adminRouter);
  }

  get(): Router {
    return this.router;
  }
}
