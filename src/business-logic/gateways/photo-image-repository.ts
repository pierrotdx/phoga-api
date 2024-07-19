import { Photo } from "../models";

export interface IPhotoImageRepository {
  save: (photo: Photo) => Promise<void>;
  getById: (photoId: Photo["_id"]) => Promise<Buffer>;
}
