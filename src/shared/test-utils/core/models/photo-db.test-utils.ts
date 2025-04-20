import { IPhoto, IPhotoStoredData } from "#photo-context";

export interface IPhotoDbTestUtils {
  getPhotoStoredData(id: IPhoto["_id"]): Promise<IPhotoStoredData>;
  getPhotoImage(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]>;
  addStoredPhotosData?(photosStoredData: IPhotoStoredData[]): Promise<void>;
  addPhoto(photo: IPhoto): Promise<void>;
  addPhotos(photos: IPhoto[]): Promise<void>;
  deletePhoto(id: IPhoto["_id"]): Promise<void>;
  deletePhotos(photoIds: IPhoto["_id"][]): Promise<void>;
}
