import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto, IRendering, ISearchPhotoOptions } from "../../models";

export class SearchPhoto {
  private photos: IPhoto[] = [];

  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(options?: ISearchPhotoOptions) {
    this.resetPhotos();
    this.photos = await this.photoMetadataDb.find(options?.rendering);
    if (!options?.excludeImages) {
      await this.fetchImages(this.photos);
    }
    return this.photos;
  }

  private resetPhotos() {
    this.photos = [];
  }

  private async fetchImages(photos: IPhoto[]) {
    const photoIds = photos.map((photo) => photo._id);
    const images = await this.photoImageDb.getByIds(photoIds);
    this.populatePhotosWithImage(images);
  }

  private populatePhotosWithImage(images: Record<IPhoto["_id"], Buffer>) {
    const photoIds = Object.keys(images);
    photoIds.forEach((id) => {
      const photo = this.photos.find((p) => p._id === id);
      if (photo) {
        photo.imageBuffer = images[id];
      }
    });
  }
}
