import { IPhotoMetadata } from "./photo-metadata";

export interface IPhotoData {
  _id: string;
  metadata?: IPhotoMetadata;
}
