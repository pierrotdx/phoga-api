import { isEmpty, isNil } from "ramda";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IAddPhotoUseCase, IPhoto, Photo } from "../../models";

export class AddPhotoUseCase implements IAddPhotoUseCase {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(photo: IPhoto): Promise<void> {
    await this.uploadImage(photo);
    await this.photoMetadataDb.insert(photo);
  }

  private async uploadImage(photo: Photo) {
    if (isNil(photo.imageBuffer) || isEmpty(photo.imageBuffer)) {
      throw new Error(`no image to upload for photo: ${photo._id}`);
    }
    await this.photoImageDb.insert(photo);
  }
}
