import { IPhotoImageDb, IPhotoMetadataDb } from "@business-logic/gateways";
import { IPhoto } from "@business-logic/models";

import { IDbsTestUtilsParams } from "./models";

export class DbsTestUtils {
  protected readonly metadataDb?: IPhotoMetadataDb;
  protected readonly imageDb?: IPhotoImageDb;

  constructor({ metadataDb, imageDb }: IDbsTestUtilsParams) {
    if (metadataDb) {
      this.metadataDb = metadataDb;
    }
    if (imageDb) {
      this.imageDb = imageDb;
    }
  }

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
    const deletePromises = photoIds.map(this.deletePhotoIfNecessary.bind(this));
    await Promise.all(deletePromises);
  }

  async deletePhotoIfNecessary(photoId: IPhoto["_id"]): Promise<void> {
    try {
      if (this.metadataDb) {
        await this.metadataDb.delete(photoId);
      }
      if (this.imageDb) {
        await this.imageDb.delete(photoId);
      }
    } catch (err) {}
  }

  async getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return await this.imageDb.getById(id);
  }

  async getPhotoMetadataFromDb(id: IPhoto["_id"]): Promise<IPhoto["metadata"]> {
    return await this.metadataDb.getById(id);
  }
}
