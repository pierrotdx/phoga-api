import { IPhoto, IPhotoStoredData } from "#photo-context";

export interface IPhotoDbTestUtils {
  getPhotoStoredData(id: IPhoto["_id"]): Promise<IPhotoStoredData>;
  addStoredPhotosData(photosStoredData: IPhotoStoredData[]): Promise<void>;
  getPhotoImage(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]>;
  addPhotos(photos: IPhoto[]): Promise<void>;
  addPhoto(photo: IPhoto): Promise<void>;
  deletePhotos(photoIds: IPhoto["_id"][]): Promise<void>;
  deletePhoto(id: IPhoto["_id"]): Promise<void>;
}
