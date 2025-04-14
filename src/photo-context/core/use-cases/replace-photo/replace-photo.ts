import { isEmpty, isNil } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import { IPhoto, IReplacePhotoUseCase, Photo } from "../../models";

export class ReplacePhotoUseCase implements IReplacePhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(photo: IPhoto): Promise<void> {
    await this.replaceImage(photo);

    await this.photoDataDb.replace(photo);
  }

  private async replaceImage(photo: Photo) {
    if (isNil(photo.imageBuffer) || isEmpty(photo.imageBuffer)) {
      throw new Error(`no image to upload for photo: ${photo._id}`);
    }
    const photoToReplaceExists = await this.photoImageDb.checkExists(photo._id);
    if (!photoToReplaceExists) {
      throw new Error(`there is no image to replace`);
    }
    await this.photoImageDb.replace(photo);
  }
}
