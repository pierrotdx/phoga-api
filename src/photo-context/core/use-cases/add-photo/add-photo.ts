import { ErrorWithStatus, HttpErrorCode } from "#shared/models";
import { isEmpty, isNil } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IAddPhotoParams,
  IAddPhotoUseCase,
  IPhoto,
  IPhotoStoredData,
  Photo,
} from "../../models";

export class AddPhotoUseCase implements IAddPhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(data: IAddPhotoParams): Promise<void> {
    await this.uploadImage(data);
    await this.uploadPhotoData(data);
  }

  private async uploadImage(data: IAddPhotoParams) {
    if (isNil(data.imageBuffer) || isEmpty(data.imageBuffer)) {
      throw new ErrorWithStatus(
        `no image to upload for photo: ${data._id}`,
        HttpErrorCode.BadRequest,
      );
    }
    await this.photoImageDb.insert(data);
  }

  private async uploadPhotoData(data: IAddPhotoParams): Promise<void> {
    const storedPhotoData: IPhotoStoredData = {
      _id: data._id,
      metadata: data.metadata,
    };
    await this.photoDataDb.insert(storedPhotoData);
  }
}
