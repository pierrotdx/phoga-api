import { Collection, FindCursor, Sort } from "mongodb";
import { isEmpty, omit } from "ramda";

import { MongoManager, imageBufferEncoding } from "@shared";

import {
  IPhoto,
  IPhotoMetadata,
  IPhotoMetadataDb,
  IRendering,
  Photo,
} from "../../../../core";
import { IMongoPhotoMetadata } from "./models";

export class PhotoMetadataDbMongo implements IPhotoMetadataDb {
  private readonly collection: Collection<IMongoPhotoMetadata>;
  private readonly defaultSize = 20;

  constructor(private readonly mongoManager: MongoManager) {
    const photoMetadataCollection = this.mongoManager.collections.PhotoMetadata;
    this.collection = this.mongoManager.getCollection<IMongoPhotoMetadata>(
      photoMetadataCollection,
    );
  }

  async getById(id: IPhoto["_id"]): Promise<IPhotoMetadata> {
    const storePhotoMetadata = await this.collection.findOne({
      _id: id,
    });
    return !storePhotoMetadata
      ? undefined
      : this.getPhotoMetadataFromStore(storePhotoMetadata);
  }

  private getPhotoMetadataFromStore(
    storePhotoMetadata: IMongoPhotoMetadata,
  ): IPhoto["metadata"] {
    const photoMetadata: IPhoto["metadata"] = omit(
      ["_id", "thumbnail"],
      storePhotoMetadata,
    );
    if (storePhotoMetadata.thumbnail) {
      photoMetadata.thumbnail = Buffer.from(
        storePhotoMetadata.thumbnail,
        imageBufferEncoding,
      );
    }
    return photoMetadata;
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

  private getStorePhotoMetadata(photo: IPhoto): IMongoPhotoMetadata {
    const thumbnail = photo.metadata.thumbnail.toString(imageBufferEncoding);
    const metadata = { ...photo.metadata, thumbnail };
    return { _id: photo._id, ...metadata };
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
    const photos = await cursor
      .map((doc) => this.getPhotoFromStore(doc))
      .toArray();
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

  private getPhotoFromStore(storePhotoMetadata: IMongoPhotoMetadata): IPhoto {
    const metadata = this.getPhotoMetadataFromStore(storePhotoMetadata);
    return new Photo(storePhotoMetadata._id, { metadata });
  }
}
