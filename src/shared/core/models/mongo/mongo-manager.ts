import { MongoCollection } from "../../constants";
import { MongoStore } from "../../models";

export interface IMongoManager {
  open(): Promise<void>;
  close(): Promise<void>;
  getCollection<T>(collectionName: MongoCollection): MongoStore<T>;
}
