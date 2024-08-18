import { Router } from "express";
import { PhotoController } from "../../app/controllers";

export class PhotoRouter {
  public readonly router: Router;

  constructor(private readonly photoController: PhotoController) {
    this.router = Router();
    this.router.get("/:id/image", this.photoController.getPhotoImageHandler);
    this.router.get(
      "/:id/metadata",
      this.photoController.getPhotoMetadataHandler,
    );
    this.router.post("/", this.photoController.addPhotoHandler);
    this.router.put("/", this.photoController.replacePhotoHandler);
    this.router.delete("/:id", this.photoController.deletePhotoHandler);
  }
}
