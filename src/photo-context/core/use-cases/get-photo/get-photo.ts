import { ErrorWithStatus, HttpErrorCode } from "#shared/models";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  GetPhotoField,
  IGetPhotoOptions,
  IGetPhotoUseCase,
  IPhoto,
  IPhotoData,
  Photo,
} from "../../models";
import { photoStoredDataToPhotoData } from "../../photo-stored-data-to-photo-data";

export class GetPhotoUseCase implements IGetPhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(
    id: IPhoto["_id"],
    options: IGetPhotoOptions = {
      fields: [GetPhotoField.ImageBuffer, GetPhotoField.PhotoData],
    },
  ): Promise<IPhoto> {
    const photoData = await this.getPhotoData(id, options);
    const imageBuffer = await this.getImageBuffer(id, options);
    return new Photo(id, { photoData, imageBuffer });
  }

  private async getPhotoData(
    id: IPhoto["_id"],
    options: IGetPhotoOptions,
  ): Promise<IPhotoData> {
    const includeData = options?.fields?.includes(GetPhotoField.PhotoData);
    if (!includeData) {
      return;
    }
    const storedPhotoData = await this.photoDataDb.getById(id);
    if (!storedPhotoData) {
      return;
    }
    const photoData = photoStoredDataToPhotoData(storedPhotoData);
    return photoData;
  }

  private async getImageBuffer(
    id: IPhoto["_id"],
    options: IGetPhotoOptions,
  ): Promise<IPhoto["imageBuffer"]> {
    const includeImageBuffer = options?.fields?.includes(
      GetPhotoField.ImageBuffer,
    );
    if (!includeImageBuffer) {
      return;
    }

    const imageBuffer = await this.photoImageDb.getById(id);
    if (!imageBuffer) {
      const error = new ErrorWithStatus(
        "photo does not exist",
        HttpErrorCode.NotFound,
      );
      throw error;
    }

    return imageBuffer;
  }
}
