import { EntryPointId, entryPoints } from "@http-server";

import { PhotoController } from "../controllers";
import { wrapWithErrorCatcher } from "../error-catcher";
import { ExpressRouter } from "./express-router";

export class PhotoRouter extends ExpressRouter {
  constructor(private readonly photoController: PhotoController) {
    super();
    this.router.get(
      entryPoints.getRelativePath(EntryPointId.GetPhotoImage),
      wrapWithErrorCatcher(this.photoController.getPhotoImageHandler),
    );
    this.router.get(
      entryPoints.getRelativePath(EntryPointId.GetPhotoMetadata),
      wrapWithErrorCatcher(this.photoController.getPhotoMetadataHandler),
    );
  }
}
