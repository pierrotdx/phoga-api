import { resetErrorsCount } from "ajv/dist/compile/errors";

import { IImageEditor, ImageEditor, ImageSize } from "@shared";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto, ISearchPhotoOptions } from "../../models";

export class SearchPhoto {
  private photos: IPhoto[] = [];

  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
    private readonly imageEditor: IImageEditor,
  ) {}

  async execute(options?: ISearchPhotoOptions) {
    this.resetPhotos();
    this.photos = await this.photoMetadataDb.find(options?.rendering);
    if (!options?.excludeImages) {
      await this.fetchImages(this.photos, options?.imageSize);
    }
    return this.photos;
  }

  private resetPhotos() {
    this.photos = [];
  }

  private async fetchImages(
    photos: IPhoto[],
    imageSize?: ImageSize,
  ): Promise<void> {
    const photoIds = photos.map((photo) => photo._id);
    const dbImages = await this.photoImageDb.getByIds(photoIds);
    this.populatePhotosWithImage(dbImages);
    if (imageSize) {
      await this.resizePhotos(this.photos, imageSize);
    }
  }

  private async resizePhotos(photos: IPhoto[], size: ImageSize): Promise<void> {
    const promises = photos.map(async (photo) => {
      const resizedImage = await this.imageEditor.resize(
        photo.imageBuffer,
        size,
      );
      photo.imageBuffer = resizedImage;
    });
    await Promise.all(promises);
  }

  private populatePhotosWithImage(images: Record<IPhoto["_id"], Buffer>): void {
    const photoIds = Object.keys(images);
    photoIds.forEach((id) => {
      const photo = this.photos.find((p) => p._id === id);
      if (photo) {
        photo.imageBuffer = images[id];
      }
    });
  }
}
