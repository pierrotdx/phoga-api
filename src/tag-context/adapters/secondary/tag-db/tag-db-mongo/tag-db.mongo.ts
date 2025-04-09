import { MongoDoc, MongoManager, MongoStore } from "#shared/mongo";
import { Collection, Filter } from "mongodb";
import { isEmpty, isNil } from "ramda";

import { ISearchTagFilter, ITag, ITagDb } from "../../../../core";

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

  async find(filter?: ISearchTagFilter): Promise<ITag[]> {
    if (!filter || isEmpty(filter)) {
      return await this.tagCollection.find().toArray();
    }
    const mongoFilter: Filter<ITag> = {};
    if (filter?.name) {
      mongoFilter.name = { $regex: filter.name };
    }
    return await this.tagCollection.find(mongoFilter).toArray();
  }
}
