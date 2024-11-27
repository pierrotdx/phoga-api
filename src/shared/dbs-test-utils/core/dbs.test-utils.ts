import { IPhoto, IPhotoImageDb, IPhotoMetadataDb, Photo } from "@domain";

import { IDbsTestUtils } from "./models";

export class DbsTestUtils implements IDbsTestUtils {
  constructor(
    private readonly metadataDb?: IPhotoMetadataDb,
    private readonly imageDb?: IPhotoImageDb,
  ) {}

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    const insertPromises = photos.map(this.insertPhotoInDbs.bind(this));
    await Promise.all(insertPromises);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    if (this.metadataDb && photo.metadata) {
      await this.metadataDb.insert(photo);
    }
    if (this.imageDb && photo.imageBuffer) {
      await this.imageDb.insert(photo);
    }
  }

  async deletePhotosInDbs(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map((id) =>
      this.deletePhotoIfNecessary(id),
    );
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

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    const imageBuffer = await this.getPhotoImageFromDb(id);
    const metadata = await this.getPhotoMetadataFromDb(id);
    return new Photo(id, { imageBuffer, metadata });
  }
  
}
