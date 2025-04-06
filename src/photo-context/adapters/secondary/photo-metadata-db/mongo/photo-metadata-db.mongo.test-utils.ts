import { clone, omit } from "ramda";

import { comparePhotoDates, DbsTestUtils, IPhoto } from "../../../../core";
import { PhotoMetadataDbMongo } from "./photo-metadata-db.mongo";
import { IMongoCollections, MongoManager, MongoStore } from "@shared/mongo";
import { IAssertionsCounter } from "@shared/assertions-counter";
import { SortDirection } from "@shared/models";


type TDoc = MongoStore<IPhoto["metadata"]>;

export class PhotoMetadataDbMongoTestUtils {
  private readonly mongoManager: MongoManager;
  private dbsTestUtils: DbsTestUtils;
  public photoMetadataDb: PhotoMetadataDbMongo;

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
    this.testUtilsFactory();
  }

  private setupDb(): void {
    this.photoMetadataDb = new PhotoMetadataDbMongo(this.mongoManager);
  }

  private testUtilsFactory() {
    this.dbsTestUtils = new DbsTestUtils(this.photoMetadataDb, undefined);
  }

  async internalTeardown(): Promise<void> {
    await this.mongoManager.close();
  }

  async getDocFromDb(_id: IPhoto["_id"]): Promise<TDoc> {
    const metadata = await this.dbsTestUtils.getPhotoMetadataFromDb(_id);
    if (metadata) {
      return { _id, ...metadata };
    }
  }

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    await this.dbsTestUtils.insertPhotosInDbs(photos);
  }

  async deletePhotoIfNecessary(photoId: IPhoto["_id"]): Promise<void> {
    await this.dbsTestUtils.deletePhotoIfNecessary(photoId);
  }

  async deletePhotosInDbs(photoIds: IPhoto["_id"][]): Promise<void> {
    await this.dbsTestUtils.deletePhotosInDbs(photoIds);
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

  async expectPhotoMetadataToReplaceDoc(
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
    expect(doc._id).toBe(expectedPhoto._id);
    const docMetadata = omit(["_id"], doc);
    expect(docMetadata).toEqual(expectedPhoto.metadata);
    assertionsCounter.increase(2);
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
