import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";

export class DeletePhoto {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(id: IPhoto["_id"]) {
    await this.photoImageDb.delete(id);
    await this.photoMetadataDb.delete(id);
  }
}
