import { IPhoto, IPhotoMetadata } from "../models";

export interface IPhotoMetadataDb {
  insert: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<IPhotoMetadata>;
  delete: (id: IPhoto["_id"]) => Promise<void>;
  replace: (photo: IPhoto) => Promise<void>;
}
