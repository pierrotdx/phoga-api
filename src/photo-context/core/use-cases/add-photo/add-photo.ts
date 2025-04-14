import { isEmpty, isNil } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import { IAddPhotoUseCase, IPhoto, Photo } from "../../models";

export class AddPhotoUseCase implements IAddPhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(photo: IPhoto): Promise<void> {
    await this.uploadImage(photo);
    await this.photoDataDb.insert(photo);
  }

  private async uploadImage(photo: Photo) {
    if (isNil(photo.imageBuffer) || isEmpty(photo.imageBuffer)) {
      throw new Error(`no image to upload for photo: ${photo._id}`);
    }
    await this.photoImageDb.insert(photo);
  }
}
