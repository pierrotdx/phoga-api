import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { PhotoController } from "../controllers";
import { wrapWithErrorCatcher } from "../error-catcher";
import { IExpressRouter } from "../models";

export class PhotoRouter implements IExpressRouter {
  private readonly router: Router;

  constructor(private readonly photoController: PhotoController) {
    this.router = Router();
    this.router.get(
      entryPoints.getRelativePath(EntryPointId.GetPhotoImage),
      wrapWithErrorCatcher(this.photoController.getPhotoImageHandler),
    );
    this.router.get(
      entryPoints.getRelativePath(EntryPointId.GetPhotoMetadata),
      wrapWithErrorCatcher(this.photoController.getPhotoMetadataHandler),
    );
  }

  getRouter() {
    return this.router;
  }
}
