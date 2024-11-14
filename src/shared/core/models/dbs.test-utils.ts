import { IPhoto } from "@domain";

export interface IDbsTestUtils {
  insertPhotosInDbs(photos: IPhoto[]): Promise<void>;
  insertPhotoInDbs(photo: IPhoto): Promise<void>;
  deletePhotosInDbs(photoIds: IPhoto["_id"][]): Promise<void>;
  deletePhotoIfNecessary(photoId: IPhoto["_id"]): Promise<void>;
  getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]>;
  getPhotoMetadataFromDb(id: IPhoto["_id"]): Promise<IPhoto["metadata"]>;
  getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto>;
}
