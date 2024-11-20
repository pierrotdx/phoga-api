import { MongoStore } from ".";
import { MongoCollection } from "./mongo-collection";

export interface IMongoManager {
  open(): Promise<void>;
  close(): Promise<void>;
  getCollection<T>(collectionName: MongoCollection): MongoStore<T>;
}
