import { ExpressRouter, wrapWithErrorCatcher } from "@shared/express";

import { PhotoController, PhotoEntryPointId, entryPoints } from "../../../core";

export class PhotoRouter extends ExpressRouter {
  constructor(private readonly photoController: PhotoController) {
    super();
    this.router.get(
      entryPoints.getRelativePath(PhotoEntryPointId.GetPhotoImage),
      wrapWithErrorCatcher(this.photoController.getImage),
    );
    this.router.get(
      entryPoints.getRelativePath(PhotoEntryPointId.GetPhotoMetadata),
      wrapWithErrorCatcher(this.photoController.getMetadata),
    );
    this.router.get(
      entryPoints.getRelativePath(PhotoEntryPointId.SearchPhoto),
      wrapWithErrorCatcher(this.photoController.search),
    );
  }
}
