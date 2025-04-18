import { ExpressPhotoTestUtils, IPhoto, PhotoTestUtils } from "#photo-context";
import { SortDirection } from "#shared/models";
import { IUuidGenerator, UuidGenerator } from "#shared/uuid";
import { ITag, TagTestUtils } from "#tag-context";
import { Response, Test } from "supertest";

import { AppServerSetupE2ETestUtils } from "./app-server.setup.e2e-test-utils";

export class AppServerTestUtils extends AppServerSetupE2ETestUtils {
  private expressSharedTestUtils: ExpressPhotoTestUtils;
  private photoTestUtils: PhotoTestUtils;
  private tagTestUtils: TagTestUtils;
  private readonly uuidGenerator: IUuidGenerator = new UuidGenerator();

  constructor(testEnv: any) {
    super(testEnv);
  }

  async globalBeforeEach(): Promise<void> {
    await this.setupDbs();
    this.testUtilsFactory();
  }

  private testUtilsFactory() {
    this.expressSharedTestUtils = new ExpressPhotoTestUtils();
    this.photoTestUtils = new PhotoTestUtils(
      this.photoBaseDb,
      this.photoImageDbGcs,
    );
    this.tagTestUtils = new TagTestUtils(this.tagDb);
  }

  async globalAfterEach(): Promise<void> {
    await this.closeAppServer();
  }

  async globalAfterAll(): Promise<void> {
    await this.closeMongoConnection();
  }

  async getToken(): Promise<string> {
    return await this.tokenProvider.getToken({
      username: this.username,
      password: this.password,
      audience: this.audience,
    });
  }

  async deletePhotoFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoTestUtils.deletePhotoFromDb(id);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.photoTestUtils.insertPhotoInDb(photo);
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.photoTestUtils.getPhotoFromDb(id);
  }

  getPayloadFromPhoto(photo: IPhoto) {
    return this.expressSharedTestUtils.getPayloadFromPhoto(photo);
  }

  addFormDataToReq(req: Test, photo: IPhoto): void {
    this.expressSharedTestUtils.addFormDataToReq(req, photo);
  }

  getPhotoFromResponse(res: Response): IPhoto {
    return this.expressSharedTestUtils.getPhotoFromResponse(res);
  }

  async expectPhotoToBeUploaded(photo: IPhoto): Promise<void> {
    await this.photoTestUtils.expectPhotoToBeUploaded(photo);
  }

  expectMatchingPhotos(expectedPhoto: IPhoto, result: IPhoto): void {
    this.photoTestUtils.expectMatchingPhotos(expectedPhoto, result);
    this.photoTestUtils.checkAssertions();
  }

  expectSearchResultMatchingSize(searchResult: any[], size: number): void {
    return this.photoTestUtils.expectPhotosArraySizeToBe(searchResult, size);
  }

  expectSearchResultMatchingDateOrdering(
    searchResult: any[],
    dateOrdering: SortDirection,
  ): void {
    return this.photoTestUtils.expectPhotosOrderToBe(
      searchResult,
      dateOrdering,
    );
  }

  async expectPhotoToBeReplacedInDb(
    dbPhotoBefore: IPhoto,
    expectedPhoto: IPhoto,
  ): Promise<void> {
    await this.photoTestUtils.expectPhotoToBeReplacedInDb(
      dbPhotoBefore,
      expectedPhoto,
    );
  }

  async expectPhotoToBeDeletedFromDbs(id: IPhoto["_id"]): Promise<void> {
    await this.photoTestUtils.expectPhotoToBeDeletedFromDbs(id);
  }

  async expectTagToBeInDb(expectedTag: ITag): Promise<void> {
    await this.tagTestUtils.expectTagToBeInDb(expectedTag);
  }

  expectTagsToBeEqual(tag1: ITag, tag2: ITag): void {
    this.tagTestUtils.expectTagsToBeEqual(tag1, tag2);
  }

  async expectTagToBeDeleted(id: ITag["_id"]): Promise<void> {
    await this.tagTestUtils.expectTagToBeDeleted(id);
  }

  expectEqualTagArrays(tags1: ITag[], tags2: ITag[]) {
    this.tagTestUtils.expectEqualTagArrays(tags1, tags2);
    this.tagTestUtils.checkAssertions();
  }

  generateId(): string {
    return this.uuidGenerator.generate();
  }

  async insertTagInDb(tag: ITag): Promise<void> {
    await this.tagTestUtils.insertTagInDb(tag);
  }

  async insertTagsInDb(tags: ITag[]): Promise<void> {
    await this.tagTestUtils.insertTagsInDb(tags);
  }

  async deleteTagFromDb(tagId: ITag["_id"]): Promise<void> {
    await this.tagTestUtils.deleteTagFromDb(tagId);
  }

  async deleteTagsFromDb(tags: ITag[]): Promise<void> {
    await this.tagTestUtils.deleteTagsFromDb(tags);
  }
}
