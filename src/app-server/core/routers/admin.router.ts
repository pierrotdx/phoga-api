import { IAuthHandler } from "#auth-context";
import { AdminPhotoRouter, IPhotoDataDb, IPhotoImageDb } from "#photo-context";
import { BaseEntryPoints, BaseEntryPointsId } from "#shared/entry-points";
import { IExpressRouter } from "#shared/express";
import { AdminTagRouter, ITagDb } from "#tag-context";
import { Router } from "express";

export class AdminRouter implements IExpressRouter {
  private readonly router = Router();

  private readonly entryPoints = new BaseEntryPoints();

  constructor(
    private readonly authHandler: IAuthHandler,
    private readonly photoDataDb: IPhotoDataDb,
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
      BaseEntryPointsId.AdminPhotoData,
    );
    const adminPhotoRouter = new AdminPhotoRouter(
      this.authHandler,
      this.photoDataDb,
      this.imageDb,
      this.tagDb,
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
