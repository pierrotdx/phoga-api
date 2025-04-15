import { ErrorWithStatus, HttpErrorCode } from "#shared/models";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IPhoto,
  IPhotoStoredData,
  IReplacePhotoParams,
  IReplacePhotoUseCase,
} from "../../models";

export class ReplacePhotoUseCase implements IReplacePhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(data: IReplacePhotoParams): Promise<void> {
    await this.replaceImage(data);
    await this.replacePhotoData(data);
  }

  private async replaceImage(data: IReplacePhotoParams) {
    this.checkImage(data.imageBuffer);
    await this.checkPhotoToReplace(data._id);
    await this.photoImageDb.replace(data);
  }

  private checkImage(imageBuffer: IPhoto["imageBuffer"]): void {
    if (!imageBuffer) {
      const error = new ErrorWithStatus(
        "need a new image",
        HttpErrorCode.BadRequest,
      );
      throw error;
    }
  }

  private async checkPhotoToReplace(id: IPhoto["_id"]): Promise<void> {
    const photoToReplaceExists = await this.photoImageDb.checkExists(id);
    if (!photoToReplaceExists) {
      const error = new ErrorWithStatus(
        "there is no photo to replace",
        HttpErrorCode.NotFound,
      );
      throw error;
    }
  }

  private async replacePhotoData(data: IReplacePhotoParams): Promise<void> {
    const photoStoredData: IPhotoStoredData = {
      _id: data._id,
      metadata: data.metadata,
    };
    await this.photoDataDb.replace(photoStoredData);
  }
}
