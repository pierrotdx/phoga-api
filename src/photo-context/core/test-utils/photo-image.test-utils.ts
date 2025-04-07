import { IPhotoImageDb } from "../gateways";
import { IPhoto } from "../models";

export class PhotoImageTestUtils {
  constructor(private readonly imageDb: IPhotoImageDb) {}

  async getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return await this.imageDb.getById(id);
  }

  async deletePhotoImageFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.imageDb.delete(id);
  }

  async insertPhotoImageInDbs(photo: IPhoto): Promise<void> {
    if (photo.imageBuffer) {
      await this.imageDb.insert(photo);
    }
  }
}
