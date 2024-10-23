import { IPhotoImageDb, IPhotoMetadataDb } from "@business-logic/gateways";
import { IPhoto } from "@business-logic/models";

export class DbsTestUtils {
  constructor(
    private readonly metadataDb?: IPhotoMetadataDb,
    private readonly imageDb?: IPhotoImageDb,
  ) {}

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    const insertPromises = photos.map(this.insertPhotoInDbs.bind(this));
    await Promise.all(insertPromises);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    if (this.metadataDb) {
      await this.metadataDb.insert(photo);
    }
    if (this.imageDb) {
      await this.imageDb.insert(photo);
    }
  }

  async deletePhotosInDbs(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map(this.deletePhotoInDbs.bind(this));
    await Promise.all(deletePromises);
  }

  async deletePhotoInDbs(photoId: IPhoto["_id"]): Promise<void> {
    if (this.metadataDb) {
      await this.metadataDb.delete(photoId);
    }
    if (this.imageDb) {
      await this.imageDb.delete(photoId);
    }
  }

  async getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return await this.imageDb.getById(id);
  }

  async getPhotoMetadataFromDb(id: IPhoto["_id"]): Promise<IPhoto["metadata"]> {
    return await this.metadataDb.getById(id);
  }
}
