import { MongoStore } from "#shared/mongo";

import { IPhoto } from "../../../../../core";

export interface IMongoPhotoMetadata extends MongoStore<IPhoto["metadata"]> {}
