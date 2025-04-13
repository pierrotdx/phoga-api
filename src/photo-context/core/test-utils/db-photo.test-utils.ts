import { isEmpty, omit } from "ramda";

import { IPhotoBaseDb, IPhotoImageDb } from "../gateways";
import { IPhoto, IPhotoBase } from "../models";

export class DbPhotoTestUtils {
  constructor(
    private readonly photoBaseDb?: IPhotoBaseDb,
    private readonly photoImageDb?: IPhotoImageDb,
  ) {}

  async getPhotoBaseFromDb(id: IPhoto["_id"]): Promise<IPhotoBase> {
    return (await this.photoBaseDb?.getById(id)) || undefined;
  }

  async deletePhotoBaseFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoBaseDb?.delete(id);
  }

  async insertPhotoBaseInDb(photo: IPhoto): Promise<void> {
    const photoBase: IPhotoBase = omit(["imageBuffer"], photo);
    if (!isEmpty(photoBase)) {
      await this.photoBaseDb?.insert(photoBase);
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
    await this.insertPhotoBaseInDb(photo);
    await this.insertPhotoImageInDb(photo);
  }

  async deletePhotosFromDb(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map((id) => this.deletePhotoFromDb(id));
    await Promise.all(deletePromises);
  }

  async deletePhotoFromDb(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.deletePhotoBaseFromDb(id);
      await this.deletePhotoImageFromDb(id);
    } catch (err) {}
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    const imageBuffer = await this.getPhotoImageFromDb(id);
    const storePhoto = await this.getPhotoBaseFromDb(id);
    return { imageBuffer, ...storePhoto };
  }
}
