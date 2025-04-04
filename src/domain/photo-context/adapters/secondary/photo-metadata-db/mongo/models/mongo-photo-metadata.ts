import { IPhoto } from "@domain";
import { MongoStore } from "@shared";

export interface IMongoPhotoMetadata extends MongoStore<IPhoto["metadata"]> {}
