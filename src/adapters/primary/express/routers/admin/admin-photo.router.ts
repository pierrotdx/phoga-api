import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { AdminPhotoController } from "../../controllers";
import { wrapWithErrorCatcher } from "../../error-catcher";
import { IExpressRouter } from "../../models";

export class AdminPhotoRouter implements IExpressRouter {
  private readonly router: Router;

  constructor(private readonly adminPhotoController: AdminPhotoController) {
    this.router = Router();
    this.router.post(
      entryPoints.getRelativePath(EntryPointId.AddPhoto),
      wrapWithErrorCatcher(this.adminPhotoController.addPhotoHandler),
    );
    this.router.put(
      entryPoints.getRelativePath(EntryPointId.ReplacePhoto),
      wrapWithErrorCatcher(this.adminPhotoController.replacePhotoHandler),
    );
    this.router.delete(
      entryPoints.getRelativePath(EntryPointId.DeletePhoto),
      wrapWithErrorCatcher(this.adminPhotoController.deletePhotoHandler),
    );
  }

  getRouter() {
    return this.router;
  }
}
