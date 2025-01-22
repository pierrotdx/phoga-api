import { Collection } from "mongodb";

import { MongoStore } from ".";

export interface IMongoManager {
  open(): Promise<void>;
  close(): Promise<void>;
  getCollection<T>(collectionName: string): Collection<MongoStore<T>>;
}
