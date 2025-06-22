import { ErrorWithStatus, HttpErrorCode } from "#shared/models";

import { IPhotoDataDb } from "../../gateways";
import { IGetPhotoUseCase, IPhoto } from "../../models";

export class GetPhotoUseCase implements IGetPhotoUseCase {
  private readonly photoDoesNotExistError = new ErrorWithStatus(
    "photo does not exist",
    HttpErrorCode.NotFound,
  );

  constructor(private readonly photoDataDb: IPhotoDataDb) {}

  async execute(id: IPhoto["_id"]): Promise<IPhoto> {
    const result = await this.photoDataDb.getById(id);
    if (!result) {
      throw this.photoDoesNotExistError;
    }
    return result;
  }
}
