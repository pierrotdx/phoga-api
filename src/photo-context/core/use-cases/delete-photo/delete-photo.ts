import { IPhotoBaseDb, IPhotoImageDb } from "../../gateways";
import { IDeletePhotoUseCase, IPhoto } from "../../models";

export class DeletePhotoUseCase implements IDeletePhotoUseCase {
  constructor(
    private readonly photoBaseDb: IPhotoBaseDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(id: IPhoto["_id"]) {
    await this.photoImageDb.delete(id);
    await this.photoBaseDb.delete(id);
  }
}
