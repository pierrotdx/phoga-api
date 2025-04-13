import { IRendering } from "#shared/models";
import { MongoManager } from "#shared/mongo";
import { Collection, FindCursor, Sort } from "mongodb";
import { isEmpty, omit } from "ramda";

import { IPhoto, IPhotoBase, IPhotoBaseDb } from "../../../../core";

export class PhotoBaseDbMongo implements IPhotoBaseDb {
  private readonly collection: Collection<IPhotoBase>;
  private readonly defaultSize = 20;

  constructor(private readonly mongoManager: MongoManager) {
    const photoBaseCollection = this.mongoManager.collections.PhotoBase;
    this.collection =
      this.mongoManager.getCollection<IPhotoBase>(photoBaseCollection);
  }

  async getById(_id: IPhoto["_id"]): Promise<IPhotoBase> {
    return await this.collection.findOne({ _id });
  }

  async insert(photo: IPhoto): Promise<void> {
    await this.insertOrReplace(photo);
  }

  async replace(photo: IPhoto): Promise<void> {
    await this.insertOrReplace(photo);
  }

  private async insertOrReplace(photo: IPhoto) {
    const photoBase: IPhotoBase = omit(["imageBuffer"], photo);
    await this.collection.replaceOne({ _id: photo._id }, photoBase, {
      upsert: true,
    });
  }

  async delete(_id: IPhoto["_id"]): Promise<void> {
    await this.collection.deleteOne({ _id });
  }

  async find(rendering?: IRendering): Promise<IPhotoBase[]> {
    if (rendering?.size == 0) {
      return [];
    }
    const cursor = this.collection.find();
    this.setCursorRendering(cursor, rendering);
    const photos = await cursor.toArray();
    return photos as IPhotoBase[];
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
