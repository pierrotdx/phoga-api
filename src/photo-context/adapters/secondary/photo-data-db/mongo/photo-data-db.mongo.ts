import { IRendering, ISearchResult, SortDirection } from "#shared/models";
import { MongoManager } from "#shared/mongo";
import { AggregationCursor, Collection, Document, Sort } from "mongodb";
import { isEmpty } from "ramda";

import {
  IPhoto,
  IPhotoData,
  IPhotoDataDb,
  IPhotoStoredData,
  ISearchPhotoFilter,
} from "../../../../core";

export class PhotoDataDbMongo implements IPhotoDataDb {
  private readonly collection: Collection<IPhotoStoredData>;
  private readonly defaultSize = 20;
  private readonly defaultSort: Sort = { "manifest.creation": -1 };

  constructor(private readonly mongoManager: MongoManager) {
    const photoDataCollection = this.mongoManager.collections.PhotoData;
    this.collection =
      this.mongoManager.getCollection<IPhotoData>(photoDataCollection);
  }

  async getById(_id: IPhoto["_id"]): Promise<IPhotoStoredData> {
    return (await this.collection.findOne({ _id })) ?? undefined;
  }

  async insert(photoDataStore: IPhotoStoredData): Promise<void> {
    await this.insertOrReplace(photoDataStore);
  }

  async replace(photoDataStore: IPhotoStoredData): Promise<void> {
    await this.insertOrReplace(photoDataStore);
  }

  private async insertOrReplace(photoDataStore: IPhotoStoredData) {
    await this.collection.replaceOne(
      { _id: photoDataStore._id },
      photoDataStore,
      {
        upsert: true,
      },
    );
  }

  async delete(_id: IPhoto["_id"]): Promise<void> {
    await this.collection.deleteOne({ _id });
  }

  async find(params?: {
    filter?: ISearchPhotoFilter;
    rendering?: IRendering;
  }): Promise<ISearchResult<IPhotoStoredData>> {
    const { filter, rendering } = { ...params };

    if (rendering?.size == 0) {
      return { hits: [], totalCount: 0 };
    }

    const cursor = this.collection.aggregate();
    this.match(cursor, filter);
    this.sort(cursor, rendering);
    this.selectBatch(cursor, rendering);
    this.format(cursor);
    const searchResult = (await cursor.toArray())[0];
    return searchResult as ISearchResult<IPhotoStoredData>;
  }

  private match(
    cursor: AggregationCursor<Document>,
    filter: ISearchPhotoFilter,
  ): void {
    const query: Document = {};

    if (filter?.tagId) {
      query["tags._id"] = filter.tagId;
    }

    cursor.match(query);
  }

  private sort(
    cursor: AggregationCursor<Document>,
    rendering: IRendering,
  ): void {
    const sort: Sort = {};

    if (rendering?.dateOrder) {
      sort["metadata.date"] =
        rendering?.dateOrder === SortDirection.Ascending ? 1 : -1;
    }

    if (!isEmpty(sort)) {
      cursor.sort(sort);
    } else {
      cursor.sort(this.defaultSort);
    }
  }

  private selectBatch(
    cursor: AggregationCursor<Document>,
    rendering: IRendering,
  ) {
    const size =
      typeof rendering?.size !== "number" ? this.defaultSize : rendering.size;

    let skip = (rendering?.from || 0) - 1;
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

  private format(cursor: AggregationCursor<Document>) {
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
