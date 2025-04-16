import { clone } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IPhoto,
  ISearchPhotoOptions,
  ISearchPhotoParams,
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

  async execute(searchPhotoParams: ISearchPhotoParams) {
    try {
      await this.setPhotosWithoutImages(searchPhotoParams);
      if (!searchPhotoParams?.options?.excludeImages) {
        await this.fetchImages();
      }
      const photos = clone(this.photos);
      return photos;
    } catch (err) {
      throw err;
    } finally {
      this.resetPhotos();
    }
  }

  private async setPhotosWithoutImages(
    searchPhotoParams: ISearchPhotoParams,
  ): Promise<void> {
    const { filter, options } = { ...searchPhotoParams };
    const photosStoredData = await this.photoDataDb.find({
      filter,
      rendering: options?.rendering,
    });
    this.photos = photosStoredData.map((p) => {
      const photoData = photoStoredDataToPhotoData(p);
      return new Photo(photoData._id, { photoData });
    });
  }

  private async fetchImages(): Promise<void> {
    const photoIds = this.photos.map((photo) => photo._id);
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

  private resetPhotos() {
    this.photos = [];
  }
}
