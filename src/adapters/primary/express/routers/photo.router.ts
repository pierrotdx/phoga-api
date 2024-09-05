import { Router } from "express";

import { EntryPointId, entryPoints } from "@http-server";

import { PhotoController } from "../controllers";
import { wrapWithErrorCatcher } from "../error-catcher";

export class PhotoRouter {
  public readonly router: Router;

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
    this.router.post(
      entryPoints.getRelativePath(EntryPointId.AddPhoto),
      wrapWithErrorCatcher(this.photoController.addPhotoHandler),
    );
    this.router.put(
      entryPoints.getRelativePath(EntryPointId.ReplacePhoto),
      wrapWithErrorCatcher(this.photoController.replacePhotoHandler),
    );
    this.router.delete(
      entryPoints.getRelativePath(EntryPointId.DeletePhoto),
      wrapWithErrorCatcher(this.photoController.deletePhotoHandler),
    );
  }
}
