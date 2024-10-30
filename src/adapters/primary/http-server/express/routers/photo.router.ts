import { EntryPointId, entryPoints } from "@http-server";

import { PhotoController } from "../controllers";
import { wrapWithErrorCatcher } from "../services";
import { ExpressRouter } from "./express-router";

export class PhotoRouter extends ExpressRouter {
  constructor(private readonly photoController: PhotoController) {
    super();
    this.router.get(
      entryPoints.getRelativePath(EntryPointId.GetPhotoImage),
      wrapWithErrorCatcher(this.photoController.getImage),
    );
    this.router.get(
      entryPoints.getRelativePath(EntryPointId.GetPhotoMetadata),
      wrapWithErrorCatcher(this.photoController.getMetadata),
    );
    this.router.get(
      entryPoints.getRelativePath(EntryPointId.SearchPhoto),
      wrapWithErrorCatcher(this.photoController.search),
    );
  }
}
