import {
  IPhoto,
  IPhotoData,
  IPhotoDataDb,
  IPhotoImageDb,
  IPhotoStoredData,
  Photo,
} from "#photo-context";
import { omit } from "ramda";

export class DbPhotoTestUtils {
  constructor(
    private readonly photoDataDb?: IPhotoDataDb,
    private readonly photoImageDb?: IPhotoImageDb,
  ) {}

  async getPhotoStoredDataFromDb(id: IPhoto["_id"]): Promise<IPhotoStoredData> {
    return (await this.photoDataDb?.getById(id)) || undefined;
  }

  async deletePhotoStoredDataFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoDataDb?.delete(id);
  }

  async insertStoredPhotoDataInDb(
    photoStoredData: IPhotoStoredData,
  ): Promise<void> {
    await this.photoDataDb?.insert(photoStoredData);
  }

  async insertStoredPhotosDataInDb(
    photosStoredData: IPhotoStoredData[],
  ): Promise<void> {
    const insertAll$ = photosStoredData.map(
      async (p) => await this.photoDataDb.insert(p),
    );
    await Promise.all(insertAll$);
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

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    const insertPromises = photos.map(this.insertPhotoInDbs.bind(this));
    await Promise.all(insertPromises);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    const storedPhotoData: IPhotoStoredData = omit(["imageBuffer"], photo);
    await this.insertStoredPhotoDataInDb(storedPhotoData);
    await this.insertPhotoImageInDb(photo);
  }

  async deletePhotosFromDb(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map((id) => this.deletePhotoFromDb(id));
    await Promise.all(deletePromises);
  }

  async deletePhotoFromDb(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.deletePhotoStoredDataFromDb(id);
      await this.deletePhotoImageFromDb(id);
    } catch (err) {}
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    const imageBuffer = await this.getPhotoImageFromDb(id);
    const photoBaseStore = await this.getPhotoStoredDataFromDb(id);
    const photoData: IPhotoData = omit(["tags"], photoBaseStore);
    const photo = new Photo(photoData._id, {
      photoData,
      imageBuffer: imageBuffer,
    });
    return photo;
  }
}
