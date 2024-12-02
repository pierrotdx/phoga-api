import { IPhoto } from "@domain";
import { MongoStore } from "@shared";

export interface IMongoPhotoMetadata
  extends MongoStore<Omit<IPhoto["metadata"], "thumbnail">> {
  thumbnail: string;
}
