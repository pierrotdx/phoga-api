import { Router } from "express";
import { PhotoController } from "../../app/controllers";

export class PhotoRouter {
  public readonly router: Router;

  constructor(private readonly photoController: PhotoController) {
    this.router = Router();
    this.router.get("/:id", this.photoController.getPhotoHandler);
  }
}
