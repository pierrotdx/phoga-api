import { IPhotoMetadata } from "../models/photo-metadata";
import { IPhoto } from "../models";

export interface IPhotoMetadataDb {
  save: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<IPhotoMetadata>;
}
