import { IEntryPoints } from "#shared/entry-points";
import { Router } from "express";

import {
  GetPhotoImageController,
  GetPhotoMetadataController,
  IPhotoImageDb,
  IPhotoMetadataDb,
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
    private readonly metadataDb: IPhotoMetadataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    this.setGetPhotoImageRoute();
    this.setGetPhotoMetadataRoute();
    this.setSearchPhotoRoute();
  }

  private setGetPhotoImageRoute(): void {
    const controller = new GetPhotoImageController(
      this.metadataDb,
      this.imageDb,
    );
    const path = this.getPath(PhotoEntryPointId.GetPhotoImage);
    this.router.get(path, controller.handler);
  }

  private setGetPhotoMetadataRoute(): void {
    const controller = new GetPhotoMetadataController(
      this.metadataDb,
      this.imageDb,
    );
    const path = this.getPath(PhotoEntryPointId.GetPhotoMetadata);
    this.router.get(path, controller.handler);
  }

  private setSearchPhotoRoute(): void {
    const controller = new SearchPhotoController(this.metadataDb, this.imageDb);
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
