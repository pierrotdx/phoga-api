import { Collection, FindCursor, Sort } from "mongodb";
import { isEmpty, omit } from "ramda";

import {
  IPhoto,
  IPhotoMetadata,
  IPhotoMetadataDb,
  IRendering,
  Photo,
} from "@business-logic";

import { MongoBase, MongoCollection, MongoStore } from "../../mongo";

export class PhotoMetadataDbMongo implements IPhotoMetadataDb {
  private readonly collection: Collection<MongoStore<IPhotoMetadata>>;
  private readonly defaultSize = 20;

  constructor(private readonly mongoBase: MongoBase) {
    this.collection = this.mongoBase.getCollection<IPhotoMetadata>(
      MongoCollection.PhotoMetadata,
    );
  }

  async getById(id: IPhoto["_id"]): Promise<IPhotoMetadata> {
    const storePhotoMetadata = await this.collection.findOne({
      _id: id,
    });
    return storePhotoMetadata ? omit(["_id"], storePhotoMetadata) : undefined;
  }

  async insert(photo: IPhoto): Promise<void> {
    await this.insertOrReplace(photo);
  }

  async replace(photo: IPhoto): Promise<void> {
    await this.insertOrReplace(photo);
  }

  private async insertOrReplace(photo: IPhoto) {
    const storePhotoMetadata = this.getStorePhotoMetadata(photo);
    await this.collection.replaceOne({ _id: photo._id }, storePhotoMetadata, {
      upsert: true,
    });
  }

  private getStorePhotoMetadata(photo: IPhoto): MongoStore<IPhoto["metadata"]> {
    return { _id: photo._id, ...photo.metadata };
  }

  async delete(_id: IPhoto["_id"]): Promise<void> {
    await this.collection.deleteOne({ _id });
  }

  async find(rendering?: IRendering): Promise<IPhoto[]> {
    if (rendering?.size == 0) {
      return [];
    }
    const cursor = this.collection.find();
    this.setCursorRendering(cursor, rendering);
    const photos = await cursor.map(this.getPhotoFromStore).toArray();
    return photos;
  }

  private setCursorRendering(cursor: FindCursor, rendering: IRendering) {
    cursor.limit(rendering?.size || this.defaultSize);

    const sort: Sort = {};
    if (rendering?.dateOrder) {
      sort.date = rendering.dateOrder;
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

  private getPhotoFromStore(
    storePhotoMetadata: MongoStore<IPhoto["metadata"]>,
  ): IPhoto {
    const metadata: IPhoto["metadata"] = omit(["_id"], storePhotoMetadata);
    return new Photo(storePhotoMetadata._id, { metadata });
  }
}
