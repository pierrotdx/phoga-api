import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto, Photo } from "../../models";

export class AddPhoto {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(photo: IPhoto): Promise<void> {
    await this.uploadImage(photo);
    await this.photoMetadataDb.insert(photo);
  }

  private async uploadImage(photo: Photo) {
    if (!photo.imageBuffer) {
      throw new Error(`no image to upload for photo: ${photo._id}`);
    }
    await this.photoImageDb.save(photo);
  }
}
