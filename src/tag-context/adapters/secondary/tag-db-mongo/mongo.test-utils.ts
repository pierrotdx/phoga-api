import { Collection } from "mongodb";

import {
  IMongoCollections,
  MongoDoc,
  MongoManager,
  MongoStore,
} from "#shared/mongo";

export class MongoTestUtils {
  readonly mongoManager: MongoManager;

  private tagCollection: Collection<MongoStore<MongoDoc>>;

  constructor(private readonly testGlobalData: any) {
    this.mongoManager = new MongoManager(
      this.getMongoUrl(),
      this.getMongoDbName(),
      this.getMongoCollections(),
    );
  }

  private getMongoUrl(): string {
    return this.testGlobalData.__MONGO_URL__;
  }

  private getMongoDbName(): string {
    return this.testGlobalData.__MONGO_DB_NAME__;
  }

  private getMongoCollections(): IMongoCollections {
    return { Tag: this.testGlobalData.__MONGO_TAG_COLLECTION__ };
  }

  async openMongoConnection(): Promise<void> {
    await this.mongoManager.open();
    this.onMongoConnection();
  }

  private onMongoConnection() {
    this.tagCollection = this.setTagCollection();
  }

  private setTagCollection() {
    const tagCollectionName = this.mongoManager.collections.Tag;
    return this.mongoManager.getCollection(tagCollectionName);
  }

  async deleteDoc(_id: MongoDoc["_id"]): Promise<void> {
    await this.tagCollection.deleteOne({ _id });
  }

  async findDoc(_id: MongoDoc["_id"]) {
    return await this.tagCollection.findOne({ _id });
  }

  async insertDoc(doc: MongoDoc): Promise<void> {
    await this.tagCollection.insertOne(doc);
  }
}
