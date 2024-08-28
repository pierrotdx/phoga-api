import { Router } from "express";

import { entryPoints } from "@http-server";

import { PhotoController } from "../controllers";
import { wrapWithErrorCatcher } from "../error-catcher";

export class PhotoRouter {
  public readonly router: Router;

  constructor(private readonly photoController: PhotoController) {
    this.router = Router();
    this.router.get(
      entryPoints.photo.getImage,
      wrapWithErrorCatcher(this.photoController.getPhotoImageHandler),
    );
    this.router.get(
      entryPoints.photo.getMetadata,
      wrapWithErrorCatcher(this.photoController.getPhotoMetadataHandler),
    );
    this.router.post(
      entryPoints.photo.add,
      wrapWithErrorCatcher(this.photoController.addPhotoHandler),
    );
    this.router.put(
      entryPoints.photo.replace,
      wrapWithErrorCatcher(this.photoController.replacePhotoHandler),
    );
    this.router.delete(
      entryPoints.photo.delete,
      wrapWithErrorCatcher(this.photoController.deletePhotoHandler),
    );
  }
}
