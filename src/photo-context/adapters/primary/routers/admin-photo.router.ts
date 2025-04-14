import { IAuthHandler } from "#auth-context";
import { IEntryPoints } from "#shared/entry-points";
import { Handler, Router } from "express";

import {
  AddPhotoController,
  DeletePhotoController,
  IAdminPhotoRouter,
  IPhotoDataDb,
  IPhotoImageDb,
  PhotoEntryPointId,
  PhotoEntryPoints,
  ReplacePhotoController,
} from "../../../core";

export class AdminPhotoRouter implements IAdminPhotoRouter {
  private readonly router = Router();
  private readonly photoEntryPoints: IEntryPoints<PhotoEntryPointId> =
    new PhotoEntryPoints();

  constructor(
    private readonly authHandler: IAuthHandler,
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    this.setAddPhotoRoute();
    this.setReplacePhotoRoute();
    this.setDeletePhotoRoute();
  }

  private setAddPhotoRoute() {
    const path = this.getPath(PhotoEntryPointId.AddPhoto);
    const permissionsHandler = this.getPermissionHandler(
      PhotoEntryPointId.AddPhoto,
    );
    const controller = new AddPhotoController(this.photoDataDb, this.imageDb);
    this.router.post(path, permissionsHandler, controller.handler);
  }

  private setReplacePhotoRoute() {
    const path = this.getPath(PhotoEntryPointId.ReplacePhoto);
    const permissionsHandler = this.getPermissionHandler(
      PhotoEntryPointId.ReplacePhoto,
    );
    const controller = new ReplacePhotoController(
      this.photoDataDb,
      this.imageDb,
    );
    this.router.put(path, permissionsHandler, controller.handler);
  }

  private setDeletePhotoRoute() {
    const path = this.getPath(PhotoEntryPointId.DeletePhoto);
    const permissionsHandler = this.getPermissionHandler(
      PhotoEntryPointId.DeletePhoto,
    );
    const controller = new DeletePhotoController(
      this.photoDataDb,
      this.imageDb,
    );
    this.router.delete(path, permissionsHandler, controller.handler);
  }

  private getPath(photoEntryPoints: PhotoEntryPointId): string {
    return this.photoEntryPoints.getRelativePath(photoEntryPoints);
  }

  private getPermissionHandler(photoEntryPointId: PhotoEntryPointId): Handler {
    const permissions = this.photoEntryPoints.getPermissions(photoEntryPointId);
    return this.authHandler.requirePermissions(permissions);
  }

  get(): Router {
    return this.router;
  }
}
