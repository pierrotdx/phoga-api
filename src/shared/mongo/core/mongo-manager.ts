import { Db, MongoClient } from "mongodb";

import { IMongoCollections, IMongoManager, MongoStore } from "./models";

export class MongoManager implements IMongoManager {
  private readonly client: MongoClient;
  private db: Db;

  constructor(
    private readonly mongoUrl: string,
    private readonly mongoDbName: string,
    public readonly collections: IMongoCollections,
  ) {
    this.client = new MongoClient(this.mongoUrl);
  }

  async open() {
    await this.client.connect();
    this.db = this.client.db(this.mongoDbName);
  }

  async close() {
    await this.client.close();
  }

  getCollection<T>(collectionName: string) {
    return this.db.collection<MongoStore<T>>(collectionName);
  }
}
