import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { AdminPhotoController } from "../../controllers";
import { wrapWithErrorCatcher } from "../../error-catcher";
import { IExpressRouter, RequestHandler } from "../../models";

export class AdminPhotoRouter implements IExpressRouter {
  private readonly router: Router;

  constructor(private readonly adminPhotoController: AdminPhotoController) {
    this.router = Router();
    this.setAddPhotoRoute();
    this.setReplacePhotoRoute();
    this.setDeletePhotoRoute();
  }
  getRouter() {
    return this.router;
  }

  private setAddPhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.AddPhoto);
    const path = entryPoint.getRelativePath();
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.addPhotoHandler,
    );
    this.router.post(path, requestHandler);
  }

  private setReplacePhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.ReplacePhoto);
    const path = entryPoint.getRelativePath();
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.replacePhotoHandler,
    );
    this.router.put(path, requestHandler);
  }

  private setDeletePhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.DeletePhoto);
    const path = entryPoint.getRelativePath();
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.deletePhotoHandler,
    );
    this.router.delete(path, requestHandler);
  }

  private getRequestHandler<T>(
    baseHandler: RequestHandler<T>,
  ): RequestHandler<T> {
    return wrapWithErrorCatcher(baseHandler);
  }
}
