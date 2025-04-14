import { IEntryPoints } from "#shared/entry-points";
import { Router } from "express";

import {
  GetPhotoDataController,
  GetPhotoImageController,
  IPhotoDataDb,
  IPhotoImageDb,
  IPhotoRouter,
  PhotoEntryPointId,
  PhotoEntryPoints,
  SearchPhotoController,
} from "../../../core";

export class PhotoRouter implements IPhotoRouter {
  private readonly router = Router();
  private readonly photoEntryPoints: IEntryPoints<PhotoEntryPointId> =
    new PhotoEntryPoints();

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    this.setGetPhotoImageRoute();
    this.setGetPhotoDataRoute();
    this.setSearchPhotoRoute();
  }

  private setGetPhotoImageRoute(): void {
    const controller = new GetPhotoImageController(
      this.photoDataDb,
      this.imageDb,
    );
    const path = this.getPath(PhotoEntryPointId.GetPhotoImage);
    this.router.get(path, controller.handler);
  }

  private setGetPhotoDataRoute(): void {
    const controller = new GetPhotoDataController(
      this.photoDataDb,
      this.imageDb,
    );
    const path = this.getPath(PhotoEntryPointId.GetPhotoData);
    this.router.get(path, controller.handler);
  }

  private setSearchPhotoRoute(): void {
    const controller = new SearchPhotoController(
      this.photoDataDb,
      this.imageDb,
    );
    const path = this.getPath(PhotoEntryPointId.SearchPhoto);
    this.router.get(path, controller.handler);
  }

  private getPath(photoEntryPointId: PhotoEntryPointId): string {
    return this.photoEntryPoints.getRelativePath(photoEntryPointId);
  }

  get(): Router {
    return this.router;
  }
}
