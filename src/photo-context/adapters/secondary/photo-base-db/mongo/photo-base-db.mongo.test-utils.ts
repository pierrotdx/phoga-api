import { IAssertionsCounter } from "#shared/assertions-counter";
import { SortDirection } from "#shared/models";
import { IMongoCollections, MongoManager } from "#shared/mongo";
import { clone, omit } from "ramda";

import {
  IPhoto,
  IPhotoBase,
  PhotoTestUtils,
  comparePhotoDates,
} from "../../../../core";
import { PhotoBaseDbMongo } from "./photo-base-db.mongo";

type TDoc = IPhotoBase;

export class PhotoBaseDbMongoTestUtils {
  private readonly mongoManager: MongoManager;
  private photoTestUtils: PhotoTestUtils;
  public photoBaseDb: PhotoBaseDbMongo;

  constructor(
    mongoUrl: string,
    mongoDbName: string,
    collections: IMongoCollections,
  ) {
    this.mongoManager = new MongoManager(mongoUrl, mongoDbName, collections);
  }

  async internalSetup(): Promise<void> {
    await this.mongoManager.open();
    this.setupDb();
    this.photoTestUtils = new PhotoTestUtils(this.photoBaseDb, undefined);
  }

  private setupDb(): void {
    this.photoBaseDb = new PhotoBaseDbMongo(this.mongoManager);
  }

  async internalTeardown(): Promise<void> {
    await this.mongoManager.close();
  }

  async getDocFromDb(_id: IPhoto["_id"]): Promise<TDoc> {
    return await this.photoTestUtils.getPhotoBaseFromDb(_id);
  }

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    await this.photoTestUtils.insertPhotosInDb(photos);
  }

  async deletePhotoIfNecessary(photoId: IPhoto["_id"]): Promise<void> {
    await this.photoTestUtils.deletePhotoFromDb(photoId);
  }

  async deletePhotosInDbs(photoIds: IPhoto["_id"][]): Promise<void> {
    await this.photoTestUtils.deletePhotosFromDb(photoIds);
  }

  expectMatchingPhotos(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(result._id).toEqual(expectedPhoto._id);
    expect(result.metadata).toEqual(expectedPhoto.metadata);
    assertionsCounter.increase(2);
  }

  expectMatchingPhotoArrays(
    expectedPhotos: IPhoto[],
    result: IPhoto[],
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(result.length).toBe(expectedPhotos.length);
    assertionsCounter.increase();

    const expectedPhotosWithoutImage = expectedPhotos.map((p) =>
      omit(["imageBuffer"], p),
    );

    result.forEach((photo) => {
      expect(expectedPhotosWithoutImage).toContainEqual(photo);
      assertionsCounter.increase();
    });
  }

  async expectDocToBeInsertedWithCorrectId(
    docBefore: TDoc,
    expectedPhoto: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const docAfter = await this.getDocFromDb(expectedPhoto._id);
    await this.expectDocToHaveBeenInserted(
      docBefore,
      docAfter,
      assertionsCounter,
    );
    this.expectDocToMatchExpectedPhoto(
      expectedPhoto,
      docAfter,
      assertionsCounter,
    );
    assertionsCounter.checkAssertions();
  }

  private async expectDocToHaveBeenInserted(
    docBefore: TDoc,
    docAfter: TDoc,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    expect(docBefore).toBeUndefined();
    expect(docAfter).toBeDefined();
    assertionsCounter.increase(2);
  }

  async expectPhotoBaseToReplaceDoc(
    initPhoto: IPhoto,
    expectedPhoto: IPhoto,
    docBefore: TDoc,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    this.expectDocToMatchExpectedPhoto(initPhoto, docBefore, assertionsCounter);
    const docAfter = await this.getDocFromDb(initPhoto._id);
    this.expectDocToMatchExpectedPhoto(
      expectedPhoto,
      docAfter,
      assertionsCounter,
    );
    assertionsCounter.checkAssertions();
  }

  expectDocToMatchExpectedPhoto(
    expectedPhoto: IPhoto,
    doc: TDoc,
    assertionsCounter: IAssertionsCounter,
  ): void {
    const expectedPhotoBase: IPhotoBase = omit(["imageBuffer"], expectedPhoto);
    expect(doc).toEqual(expectedPhotoBase);
    assertionsCounter.increase();
  }

  async expectDocToBeDeleted(
    storedPhoto: IPhoto,
    docBefore: TDoc,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    this.expectDocToMatchExpectedPhoto(
      storedPhoto,
      docBefore,
      assertionsCounter,
    );
    const docAfter = await this.getDocFromDb(storedPhoto._id);
    expect(docAfter).toBeUndefined();
    assertionsCounter.increase();
    assertionsCounter.checkAssertions();
  }

  getPhotosSortedByDate(photos: IPhoto[], direction: SortDirection): IPhoto[] {
    const ascendingPhotos = clone(photos).sort(comparePhotoDates);
    return direction === SortDirection.Ascending
      ? ascendingPhotos
      : ascendingPhotos.reverse();
  }
}
