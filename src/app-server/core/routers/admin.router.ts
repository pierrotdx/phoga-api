import { IAuthHandler } from "#auth-context";
import {
  AdminPhotoRouter,
  IPhotoImageDb,
  IPhotoMetadataDb,
} from "#photo-context";
import { BaseEntryPoints, BaseEntryPointsId } from "#shared/entry-points";
import { IExpressRouter } from "#shared/express";
import { AdminTagRouter, ITagDb } from "#tag-context";
import { Router } from "express";

export class AdminRouter implements IExpressRouter {
  private readonly router = Router();

  private readonly entryPoints = new BaseEntryPoints();

  constructor(
    private readonly authHandler: IAuthHandler,
    private readonly metadataDb: IPhotoMetadataDb,
    private readonly imageDb: IPhotoImageDb,
    private readonly tagDb: ITagDb,
  ) {
    this.restrictRouterAccessToAuthUsers();
    this.addAdminPhotoRouter();
    this.addAdminTagRouter();
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

  private addAdminTagRouter() {
    const path = this.entryPoints.getRelativePath(
      BaseEntryPointsId.AdminTagBase,
    );
    const adminTagRouter = new AdminTagRouter(
      this.authHandler,
      this.tagDb,
    ).get();
    this.router.use(path, adminTagRouter);
  }

  get(): Router {
    return this.router;
  }
}
