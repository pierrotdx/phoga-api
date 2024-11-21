import { Collection } from "mongodb";

import { MongoStore } from ".";
import { MongoCollection } from "./mongo-collection";

export interface IMongoManager {
  open(): Promise<void>;
  close(): Promise<void>;
  getCollection<T>(collectionName: MongoCollection): Collection<MongoStore<T>>;
}
