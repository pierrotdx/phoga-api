import { IEntryPoints } from "#shared/entry-points";
import { Router } from "express";

import {
  GetPhotoBaseController,
  GetPhotoImageController,
  IPhotoBaseDb,
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
    private readonly photoBaseDb: IPhotoBaseDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    this.setGetPhotoImageRoute();
    this.setGetPhotoBaseRoute();
    this.setSearchPhotoRoute();
  }

  private setGetPhotoImageRoute(): void {
    const controller = new GetPhotoImageController(
      this.photoBaseDb,
      this.imageDb,
    );
    const path = this.getPath(PhotoEntryPointId.GetPhotoImage);
    this.router.get(path, controller.handler);
  }

  private setGetPhotoBaseRoute(): void {
    const controller = new GetPhotoBaseController(
      this.photoBaseDb,
      this.imageDb,
    );
    const path = this.getPath(PhotoEntryPointId.GetPhotoBase);
    this.router.get(path, controller.handler);
  }

  private setSearchPhotoRoute(): void {
    const controller = new SearchPhotoController(
      this.photoBaseDb,
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
