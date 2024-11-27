import { isEmpty, isNil } from "ramda";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto, IThumbnailSetter, Photo } from "../../models";

export class AddPhoto {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
    private readonly thumbnailSetter: IThumbnailSetter,
  ) {}

  async execute(photo: IPhoto): Promise<void> {
    await this.uploadImage(photo);
    await this.thumbnailSetter.set(photo);
    await this.photoMetadataDb.insert(photo);
  }

  private async uploadImage(photo: Photo) {
    if (isNil(photo.imageBuffer) || isEmpty(photo.imageBuffer)) {
      throw new Error(`no image to upload for photo: ${photo._id}`);
    }
    await this.photoImageDb.insert(photo);
  }
}
