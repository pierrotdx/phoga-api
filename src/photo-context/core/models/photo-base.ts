import { IPhotoMetadata } from "./photo-metadata";

export interface IPhotoBase {
  _id: string;
  metadata?: IPhotoMetadata;
}
