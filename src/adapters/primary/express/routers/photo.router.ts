import { Router } from "express";
import { PhotoController } from "../controllers";
import { entryPoints } from "../../../../http-server";

export class PhotoRouter {
  public readonly router: Router;

  constructor(private readonly photoController: PhotoController) {
    this.router = Router();
    this.router.get(
      entryPoints.photo.getImage,
      this.photoController.getPhotoImageHandler,
    );
    this.router.get(
      entryPoints.photo.getMetadata,
      this.photoController.getPhotoMetadataHandler,
    );
    this.router.post(
      entryPoints.photo.add,
      this.photoController.addPhotoHandler,
    );
    this.router.put(
      entryPoints.photo.replace,
      this.photoController.replacePhotoHandler,
    );
    this.router.delete(
      entryPoints.photo.delete,
      this.photoController.deletePhotoHandler,
    );
  }
}
