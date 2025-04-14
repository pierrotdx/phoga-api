import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import { IDeletePhotoUseCase, IPhoto } from "../../models";

export class DeletePhotoUseCase implements IDeletePhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(id: IPhoto["_id"]) {
    await this.photoImageDb.delete(id);
    await this.photoDataDb.delete(id);
  }
}
