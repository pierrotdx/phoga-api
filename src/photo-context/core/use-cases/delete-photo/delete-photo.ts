import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IDeletePhotoUseCase, IPhoto } from "../../models";

export class DeletePhotoUseCase implements IDeletePhotoUseCase {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(id: IPhoto["_id"]) {
    await this.photoImageDb.delete(id);
    await this.photoMetadataDb.delete(id);
  }
}
