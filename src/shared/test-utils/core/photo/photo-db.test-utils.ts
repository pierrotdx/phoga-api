import {
  IAddPhotoParams,
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
  IPhotoStoredData,
  fromAddPhotoParamsToPhotoStoredData,
} from "#photo-context";
import { ITagDb } from "#tag-context";

import { IPhotoDbTestUtils } from "../models";

export class PhotoDbTestUtils implements IPhotoDbTestUtils {
  constructor(
    private readonly photoDataDb?: IPhotoDataDb,
    private readonly photoImageDb?: IPhotoImageDb,
    private readonly tagDb?: ITagDb,
  ) {}

  async getPhotoStoredData(id: IPhoto["_id"]): Promise<IPhotoStoredData> {
    return await this.photoDataDb?.getById(id);
  }

  async addStoredPhotosData(
    photosStoredData: IPhotoStoredData[],
  ): Promise<void> {
    const insertAll$ = photosStoredData.map(
      async (p) => await this.photoDataDb.insert(p),
    );
    await Promise.all(insertAll$);
  }

  async getPhotoImage(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return await this.photoImageDb?.getById(id);
  }

  async addPhotos(addPhotosParams: IAddPhotoParams[]): Promise<void> {
    const insertPromises = addPhotosParams.map(this.addPhoto.bind(this));
    await Promise.all(insertPromises);
  }

  async addPhoto(addPhotoParams: IAddPhotoParams): Promise<void> {
    await this.insertPhotoImageInDb(addPhotoParams);

    const storedPhotoData: IPhotoStoredData =
      await fromAddPhotoParamsToPhotoStoredData(addPhotoParams, this.tagDb);

    const imageUrl = await this.photoImageDb.getUrl(addPhotoParams._id);
    storedPhotoData.imageUrl = imageUrl;

    await this.insertStoredPhotoDataInDb(storedPhotoData);
  }

  private async insertStoredPhotoDataInDb(
    photoStoredData: IPhotoStoredData,
  ): Promise<void> {
    await this.photoDataDb?.insert(photoStoredData);
  }

  private async insertPhotoImageInDb(photo: IPhoto): Promise<void> {
    if (photo.imageBuffer) {
      await this.photoImageDb?.insert(photo);
    }
  }

  async deletePhotos(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map((id) => this.deletePhoto(id));
    await Promise.all(deletePromises);
  }

  async deletePhoto(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.deletePhotoStoredDataFromDb(id);
      await this.deletePhotoImageFromDb(id);
    } catch (err) {}
  }

  private async deletePhotoStoredDataFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoDataDb?.delete(id);
  }

  private async deletePhotoImageFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoImageDb?.delete(id);
  }
}
