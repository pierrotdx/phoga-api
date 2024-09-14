import { Handler } from "express";

import { EntryPointId, IEntryPoint, entryPoints } from "@http-server";

import { AdminPhotoController } from "../../controllers";
import { wrapWithErrorCatcher } from "../../error-catcher";
import { IExpressAuthHandler, RequestHandler } from "../../models";
import { ExpressRouter } from "../express-router";

export class AdminPhotoRouter extends ExpressRouter {
  constructor(
    private readonly adminPhotoController: AdminPhotoController,
    private readonly authHandler: IExpressAuthHandler,
  ) {
    super();
    this.setAddPhotoRoute();
    this.setReplacePhotoRoute();
    this.setDeletePhotoRoute();
  }

  private setAddPhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.AddPhoto);
    const path = entryPoint.getRelativePath();
    const scopesHandler = this.getScopesHandler(entryPoint);
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.addPhotoHandler,
    );
    this.router.post(path, scopesHandler, requestHandler);
  }

  private getScopesHandler(entryPoint: IEntryPoint): Handler {
    const scopes = entryPoint.getScopes();
    if (scopes?.length) {
      const scopesHandler = this.authHandler.requiredScopes(scopes);
      return scopesHandler;
    }
  }

  private setReplacePhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.ReplacePhoto);
    const path = entryPoint.getRelativePath();
    const scopesHandler = this.getScopesHandler(entryPoint);
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.replacePhotoHandler,
    );
    this.router.put(path, scopesHandler, requestHandler);
  }

  private setDeletePhotoRoute() {
    const entryPoint = entryPoints.get(EntryPointId.DeletePhoto);
    const path = entryPoint.getRelativePath();
    const scopesHandler = this.getScopesHandler(entryPoint);
    const requestHandler = this.getRequestHandler(
      this.adminPhotoController.deletePhotoHandler,
    );
    this.router.delete(path, scopesHandler, requestHandler);
  }

  private getRequestHandler<T>(
    baseHandler: RequestHandler<T>,
  ): RequestHandler<T> {
    return wrapWithErrorCatcher(baseHandler);
  }
}
