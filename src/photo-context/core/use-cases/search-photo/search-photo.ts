import { clone } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IPhoto,
  ISearchPhotoOptions,
  ISearchPhotoUseCase,
  Photo,
} from "../../models";
import { photoStoredDataToPhotoData } from "../../photo-stored-data-to-photo-data";

export class SearchPhotoUseCase implements ISearchPhotoUseCase {
  private photos: IPhoto[] = [];

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(options?: ISearchPhotoOptions) {
    try {
      await this.setPhotosWithoutImages(options);
      if (!options?.excludeImages) {
        await this.fetchImages(this.photos);
      }
      const photos = clone(this.photos);
      return photos;
    } catch (err) {
      throw err;
    } finally {
      this.resetPhotos();
    }
  }

  private resetPhotos() {
    this.photos = [];
  }

  private async fetchImages(photos: IPhoto[]): Promise<void> {
    const photoIds = photos.map((photo) => photo._id);
    const dbImages = await this.photoImageDb.getByIds(photoIds);
    this.populatePhotosWithImage(dbImages);
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

  private async setPhotosWithoutImages(
    options: ISearchPhotoOptions,
  ): Promise<void> {
    const photosStoredData = await this.photoDataDb.find(options?.rendering);
    this.photos = photosStoredData.map((p) => {
      const photoData = photoStoredDataToPhotoData(p);
      return new Photo(photoData._id, { photoData });
    });
  }
}
