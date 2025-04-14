import { IRendering } from "#shared/models";
import { MongoManager } from "#shared/mongo";
import { Collection, FindCursor, Sort } from "mongodb";
import { isEmpty } from "ramda";

import {
  IPhoto,
  IPhotoData,
  IPhotoDataDb,
  IPhotoStoredData,
} from "../../../../core";

export class PhotoDataDbMongo implements IPhotoDataDb {
  private readonly collection: Collection<IPhotoData>;
  private readonly defaultSize = 20;

  constructor(private readonly mongoManager: MongoManager) {
    const photoDataCollection = this.mongoManager.collections.PhotoData;
    this.collection =
      this.mongoManager.getCollection<IPhotoData>(photoDataCollection);
  }

  async getById(_id: IPhoto["_id"]): Promise<IPhotoStoredData> {
    return await this.collection.findOne({ _id });
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

  async find(rendering?: IRendering): Promise<IPhotoStoredData[]> {
    if (rendering?.size == 0) {
      return [];
    }
    const cursor = this.collection.find();
    this.setCursorRendering(cursor, rendering);
    const photos = await cursor.toArray();
    return photos as IPhotoStoredData[];
  }

  private setCursorRendering(cursor: FindCursor, rendering: IRendering) {
    cursor.limit(rendering?.size || this.defaultSize);

    const sort: Sort = {};
    if (rendering?.dateOrder) {
      sort["metadata.date"] = rendering.dateOrder;
    }
    if (!isEmpty(sort)) {
      cursor.sort(sort);
    }

    const skipValue =
      typeof rendering?.from === "number" ? rendering.from - 1 : 0;
    if (skipValue >= 1) {
      cursor.skip(skipValue);
    }
  }
}
