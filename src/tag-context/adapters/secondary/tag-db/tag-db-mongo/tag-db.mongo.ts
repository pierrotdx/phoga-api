import { MongoDoc, MongoManager, MongoStore } from "#shared/mongo";
import { Collection } from "mongodb";

import { ITag, ITagDb } from "../../../../core";

export class TagDbMongo implements ITagDb {
  private readonly tagCollection: Collection<MongoStore<MongoDoc>>;

  constructor(private readonly mongoManager: MongoManager) {
    const tagCollectionName = this.mongoManager.collections.Tags;
    this.tagCollection =
      this.mongoManager.getCollection<ITag>(tagCollectionName);
  }

  async insert(tag: ITag): Promise<void> {
    await this.tagCollection.insertOne(tag);
  }

  async getById(_id: ITag["_id"]): Promise<ITag | undefined> {
    const result = await this.tagCollection.findOne<ITag>({ _id });
    if (!result) {
      return;
    }
    return result;
  }

  async delete(_id: ITag["_id"]): Promise<void> {
    await this.tagCollection.deleteOne({ _id });
  }

  async replace(tag: ITag): Promise<void> {
    await this.tagCollection.replaceOne({ _id: tag._id }, tag, {
      upsert: true,
    });
  }
}
