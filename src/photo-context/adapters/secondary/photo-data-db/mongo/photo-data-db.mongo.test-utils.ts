import { SortDirection } from "#shared/models";
import { IMongoCollections, MongoManager } from "#shared/mongo";
import { clone } from "ramda";

import { IPhoto, comparePhotoDates } from "../../../../core";
import { PhotoDataDbMongo } from "./photo-data-db.mongo";

export class PhotoDataDbMongoTestUtils {
  private readonly mongoManager: MongoManager;
  private photoDataDb: PhotoDataDbMongo;

  constructor(
    mongoUrl: string,
    mongoDbName: string,
    collections: IMongoCollections,
  ) {
    this.mongoManager = new MongoManager(mongoUrl, mongoDbName, collections);
  }

  async globalSetup(): Promise<void> {
    await this.mongoManager.open();
    this.onConnection();
  }

  private onConnection(): void {
    this.photoDataDb = new PhotoDataDbMongo(this.mongoManager);
  }

  async globalTeardown(): Promise<void> {
    await this.mongoManager.close();
  }

  getPhotoDataDb(): PhotoDataDbMongo {
    return this.photoDataDb;
  }

  getPhotosSortedByDate(photos: IPhoto[], direction: SortDirection): IPhoto[] {
    const ascendingPhotos = clone(photos).sort(comparePhotoDates);
    return direction === SortDirection.Ascending
      ? ascendingPhotos
      : ascendingPhotos.reverse();
  }
}
