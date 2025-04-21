import {
  AddPhotoUseCase,
  DeletePhotoUseCase,
  IAddPhotoParams,
  IAddPhotoUseCase,
  IDeletePhotoUseCase,
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
  IPhotoStoredData,
} from "#photo-context";
import { HttpErrorCode } from "#shared/models";
import { ITagDb } from "#tag-context";

import { IPhotoDbTestUtils } from "../models";

export class PhotoDbE2ETestUtils implements IPhotoDbTestUtils {
  private readonly addPhotoUseCase: IAddPhotoUseCase;
  private readonly deletePhotoUseCase: IDeletePhotoUseCase;

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
    private readonly tagDb: ITagDb,
  ) {
    this.addPhotoUseCase = new AddPhotoUseCase(
      this.photoDataDb,
      this.photoImageDb,
      this.tagDb,
    );
    this.deletePhotoUseCase = new DeletePhotoUseCase(
      this.photoDataDb,
      this.photoImageDb,
    );
  }

  async getPhotoStoredData(id: IPhoto["_id"]): Promise<IPhotoStoredData> {
    return await this.photoDataDb.getById(id);
  }

  async getPhotoImage(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return await this.photoImageDb.getById(id);
  }

  async addPhotos(addPhotoParams: IAddPhotoParams[]): Promise<void> {
    const insertPromises = addPhotoParams.map(this.addPhoto.bind(this));
    await Promise.all(insertPromises);
  }

  async addPhoto(addPhotoParams: IAddPhotoParams): Promise<void> {
    await this.addPhotoUseCase.execute(addPhotoParams);
  }

  async deletePhotos(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map((id) => this.deletePhoto(id));
    await Promise.all(deletePromises);
  }

  async deletePhoto(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.deletePhotoUseCase.execute(id);
    } catch (err) {
      if (err.status === HttpErrorCode.NotFound) {
        return;
      }
    }
  }
}
