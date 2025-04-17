import { IPhoto, IPhotoStoredData } from "#photo-context";

export interface IPhotoDbTestUtils {
  getPhotoStoredDataFromDb(id: IPhoto["_id"]): Promise<IPhotoStoredData>;
  insertStoredPhotosDataInDb(
    photosStoredData: IPhotoStoredData[],
  ): Promise<void>;
  getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]>;
  insertPhotosInDbs(photos: IPhoto[]): Promise<void>;
  insertPhotoInDbs(photo: IPhoto): Promise<void>;
  deletePhotosFromDb(photoIds: IPhoto["_id"][]): Promise<void>;
  deletePhotoFromDb(id: IPhoto["_id"]): Promise<void>
}
