import { IAuthHandler } from "#auth-context";
import { IPhotoDataDb, IPhotoImageDb, PhotoRouter } from "#photo-context";
import { BaseEntryPoints, BaseEntryPointsId } from "#shared/entry-points";
import { IExpressRouter } from "#shared/express";
import { ITagDb, TagRouter } from "#tag-context";
import { Router } from "express";

import { AdminRouter } from "./admin.router";

export class AppRouter implements IExpressRouter {
  private readonly router = Router();
  private readonly entryPoints = new BaseEntryPoints();

  constructor(
    private readonly authHandler: IAuthHandler,
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
    private readonly tagDb: ITagDb,
  ) {
    this.setBaseRoute();
    this.addPhotoRouter();
    this.addTagRouter();
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
    const path = this.getPath(BaseEntryPointsId.PhotoData);
    const photoRouter = new PhotoRouter(this.photoDataDb, this.imageDb).get();
    this.router.use(path, photoRouter);
  }

  private addTagRouter() {
    const path = this.getPath(BaseEntryPointsId.TagBase);
    const tagRouter = new TagRouter(this.tagDb).get();
    this.router.use(path, tagRouter);
  }

  private addAdminRouter() {
    const path = this.getPath(BaseEntryPointsId.AdminBase);
    const adminRouter = new AdminRouter(
      this.authHandler,
      this.photoDataDb,
      this.imageDb,
      this.tagDb,
    ).get();
    const permissionHandler = this.authHandler.requiresAuth;
    this.router.use(path, permissionHandler, adminRouter);
  }

  get(): Router {
    return this.router;
  }
}
