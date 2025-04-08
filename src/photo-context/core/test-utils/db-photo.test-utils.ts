import { IPhotoImageDb, IPhotoMetadataDb } from "../gateways";
import { IPhoto, Photo } from "../models";

export class DbPhotoTestUtils {
  constructor(
    private readonly photoMetadataDb?: IPhotoMetadataDb,
    private readonly photoImageDb?: IPhotoImageDb,
  ) {}

  async getPhotoMetadataFromDb(id: IPhoto["_id"]): Promise<IPhoto["metadata"]> {
    return await this.photoMetadataDb?.getById(id);
  }

  async deletePhotoMetadataFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoMetadataDb?.delete(id);
  }

  async insertPhotoMetadataInDb(photo: IPhoto): Promise<void> {
    if (photo.metadata) {
      await this.photoMetadataDb?.insert(photo);
    }
  }

  async getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return await this.photoImageDb?.getById(id);
  }

  async deletePhotoImageFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoImageDb?.delete(id);
  }

  async insertPhotoImageInDb(photo: IPhoto): Promise<void> {
    if (photo.imageBuffer) {
      await this.photoImageDb?.insert(photo);
    }
  }

  async insertPhotosInDb(photos: IPhoto[]): Promise<void> {
    const insertPromises = photos.map(this.insertPhotoInDb.bind(this));
    await Promise.all(insertPromises);
  }

  async insertPhotoInDb(photo: IPhoto): Promise<void> {
    await this.insertPhotoMetadataInDb(photo);
    await this.insertPhotoImageInDb(photo);
  }

  async deletePhotosFromDb(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map((id) => this.deletePhotoFromDb(id));
    await Promise.all(deletePromises);
  }

  async deletePhotoFromDb(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.deletePhotoMetadataFromDb(id);
      await this.deletePhotoImageFromDb(id);
    } catch (err) {}
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    const imageBuffer = await this.getPhotoImageFromDb(id);
    const metadata = await this.getPhotoMetadataFromDb(id);
    return new Photo(id, { imageBuffer, metadata });
  }
}
