import { Handler } from "express";

import { EntryPointId, IEntryPoint, entryPoints } from "@http-server";

import { AdminPhotoController } from "../../controllers";
import { IAuthHandler, RequestHandler } from "../../models";
import { wrapWithErrorCatcher } from "../../services";
import { ExpressRouter } from "../express-router";

export class AdminPhotoRouter extends ExpressRouter {
  constructor(
    private readonly adminPhotoController: AdminPhotoController,
    private readonly authHandler: IAuthHandler,
  ) {
    super();
    this.setAddPhotoRoute();
    this.setReplacePhotoRoute();
    this.setDeletePhotoRoute();
  }

  private setAddPhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.AddPhoto);
    const path = entryPoint.getRelativePath();
    const permissionsHandler = this.getPermissionsHandler(entryPoint);
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.addPhotoHandler,
    );
    this.router.post(path, permissionsHandler, requestHandler);
  }

  private getPermissionsHandler(entryPoint: IEntryPoint): Handler {
    const permissions = entryPoint.getPermissions();
    if (permissions?.length) {
      const permissionsHandler = this.authHandler.requirePermissions(permissions);
      return permissionsHandler;
    }
  }

  private setReplacePhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.ReplacePhoto);
    const path = entryPoint.getRelativePath();
    const permissionsHandler = this.getPermissionsHandler(entryPoint);
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.replacePhotoHandler,
    );
    this.router.put(path, permissionsHandler, requestHandler);
  }

  private setDeletePhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.DeletePhoto);
    const path = entryPoint.getRelativePath();
    const permissionsHandler = this.getPermissionsHandler(entryPoint);
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.deletePhotoHandler,
    );
    this.router.delete(path, permissionsHandler, requestHandler);
  }

  private getRequestHandler<T>(
    baseHandler: RequestHandler<T>,
  ): RequestHandler<T> {
    return wrapWithErrorCatcher(baseHandler);
  }
}
