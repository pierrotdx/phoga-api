import { IPhotoMetadata } from "../../business-logic/models/photo-metadata";
import { IPhoto } from "../models";

export interface IPhotoMetadataRepository {
  save: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<IPhotoMetadata>;
}
