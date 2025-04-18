import { IPhotoBaseDb, IPhotoImageDb } from "../../gateways";
import { IPhoto, ISearchPhotoOptions, ISearchPhotoUseCase } from "../../models";

export class SearchPhotoUseCase implements ISearchPhotoUseCase {
  private photos: IPhoto[] = [];

  constructor(
    private readonly photoBaseDb: IPhotoBaseDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(options?: ISearchPhotoOptions) {
    this.resetPhotos();
    this.photos = await this.photoBaseDb.find(options?.rendering);
    if (!options?.excludeImages) {
      await this.fetchImages(this.photos);
    }
    return this.photos;
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
}
