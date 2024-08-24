import { Collection } from "mongodb";
import { omit } from "ramda";

import { IPhoto, IPhotoMetadata, IPhotoMetadataDb } from "@business-logic";

import { MongoBase, MongoCollection, MongoStore } from "../../mongo";

export class PhotoMetadataDbMongo implements IPhotoMetadataDb {
  private readonly collection: Collection<MongoStore<IPhotoMetadata>>;

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
}
