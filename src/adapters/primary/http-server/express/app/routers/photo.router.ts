import { Router } from "express";
import { PhotoController } from "../../app/controllers";
import { endpoints } from "../../../http-server.constants";

export class PhotoRouter {
  public readonly router: Router;

  constructor(private readonly photoController: PhotoController) {
    this.router = Router();
    this.router.get(
      endpoints.photo.getImage,
      this.photoController.getPhotoImageHandler,
    );
    this.router.get(
      endpoints.photo.getMetadata,
      this.photoController.getPhotoMetadataHandler,
    );
    this.router.post(endpoints.photo.add, this.photoController.addPhotoHandler);
    this.router.put(
      endpoints.photo.replace,
      this.photoController.replacePhotoHandler,
    );
    this.router.delete(
      endpoints.photo.delete,
      this.photoController.deletePhotoHandler,
    );
  }
}
