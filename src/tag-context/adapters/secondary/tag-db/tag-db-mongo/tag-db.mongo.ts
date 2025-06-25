import { ISearchResult } from "#shared/models";
import { MongoDoc, MongoManager, MongoStore } from "#shared/mongo";
import { AggregationCursor, Collection, Document, Sort } from "mongodb";

import {
  ISearchTagFilter,
  ISearchTagOptions,
  ITag,
  ITagDb,
} from "../../../../core";

export class TagDbMongo implements ITagDb {
  private readonly tagCollection: Collection<MongoStore<MongoDoc>>;

  private readonly defaultSize = 20;
  private readonly defaultSortQuery: Sort = { "manifest.creation": -1 };

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

  async find(
    filter?: ISearchTagFilter,
    options?: ISearchTagOptions,
  ): Promise<ISearchResult<ITag>> {
    const cursor = this.tagCollection.aggregate();
    this.match(cursor, filter);
    this.sort(cursor);
    this.selectBatch(cursor, options);
    this.format(cursor);
    const searchResult = (await cursor.toArray())[0];
    return searchResult as ISearchResult<ITag>;
  }

  private match(
    cursor: AggregationCursor<Document>,
    filter?: ISearchTagFilter,
  ): void {
    const query: Document = {};

    if (filter?.name) {
      query.name = {
        $regex: filter?.name,
      };
    }

    cursor.match(query);
  }

  private sort(cursor: AggregationCursor<Document>): void {
    cursor.sort(this.defaultSortQuery);
  }

  private selectBatch(
    cursor: AggregationCursor<Document>,
    options?: ISearchTagOptions,
  ): void {
    const size = options?.size || this.defaultSize;

    let skip = (options?.from || 0) - 1;
    if (skip < 0) {
      skip = 0;
    }

    // https://codebeyondlimits.com/articles/pagination-in-mongodb-the-only-right-way-to-implement-it-and-avoid-common-mistakes
    const query: Document = {
      $facet: {
        data: [{ $skip: skip }, { $limit: size }],
        metadata: [{ $count: "totalCount" }],
      },
    };
    cursor.addStage(query);
  }

  private format(cursor: AggregationCursor<Document>): void {
    const query: Document = {
      $project: {
        hits: "$data",
        totalCount: {
          $ifNull: [{ $arrayElemAt: ["$metadata.totalCount", 0] }, 0],
        },
      },
    };
    cursor.addStage(query);
  }
}
