import { ErrorWithStatus, HttpErrorCode } from "#shared/models";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import { IDeletePhotoUseCase, IPhoto, Photo } from "../../models";

export class DeletePhotoUseCase implements IDeletePhotoUseCase {
  private image: IPhoto["imageBuffer"];

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(id: IPhoto["_id"]) {
    try {
      await this.deleteImage(id);
      await this.deletePhotoData(id);
    } catch (err) {
      const error = new ErrorWithStatus(err, HttpErrorCode.InternalServerError);
      throw error;
    } finally {
      this.resetImage();
    }
  }

  async deleteImage(id: IPhoto["_id"]): Promise<void> {
    await this.saveImage(id);
    await this.photoImageDb.delete(id);
  }

  async saveImage(id: IPhoto["_id"]): Promise<void> {
    this.image = await this.photoImageDb.getById(id);
  }

  private async deletePhotoData(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.photoDataDb.delete(id);
    } catch (err) {
      await this.putBackImage(id);
      throw err;
    }
  }

  private async putBackImage(id: IPhoto["_id"]): Promise<void> {
    const photo = new Photo(id, { imageBuffer: this.image });
    await this.photoImageDb.insert(photo);
  }

  private resetImage(): void {
    delete this.image;
  }
}
