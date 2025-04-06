import { IAssertionsCounter } from "@shared/assertions-counter";
import { SharedTestUtils } from "@shared/shared-test-utils";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";
import {
  DbsTestUtils,
  PhotoMetadataTestUtils,
  PhotoSharedTestUtils,
} from "../../test-utils";

export class ReplacePhotoTestUtils {
  private photoMetadataTestUtils: PhotoMetadataTestUtils;
  private sharedTestUtils: SharedTestUtils;
  private photoSharedTestUtils: PhotoSharedTestUtils;
  private dbsTestUtils: DbsTestUtils;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  private testUtilsFactory(): void {
    this.sharedTestUtils = new SharedTestUtils();
    this.photoSharedTestUtils = new PhotoSharedTestUtils(this.sharedTestUtils);
    this.photoMetadataTestUtils = new PhotoMetadataTestUtils(
      this.photoMetadataDb,
      this.photoSharedTestUtils,
    );
    this.dbsTestUtils = new DbsTestUtils(
      this.photoMetadataDb,
      this.photoImageDb,
    );
  }

  async insertPhotoInDb(photo: IPhoto): Promise<void> {
    return await this.dbsTestUtils.insertPhotoInDbs(photo);
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.dbsTestUtils.getPhotoFromDb(id);
  }

  async deletePhotoMetadata(id: IPhoto["_id"]): Promise<void> {
    return await this.photoMetadataDb.delete(id);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    return await this.dbsTestUtils.deletePhotoIfNecessary(id);
  }

  async expectPhotoToBeReplacedInDb(
    dbPhotoBefore: IPhoto,
    expectedPhoto: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbPhotoAfter = await this.getPhotoFromDb(dbPhotoBefore._id);
    expect(dbPhotoBefore).toBeDefined();
    expect(dbPhotoAfter).toBeDefined();
    expect(dbPhotoAfter).not.toEqual(dbPhotoBefore);
    assertionsCounter.increase(3);
    this.photoSharedTestUtils.expectMatchingPhotos(
      dbPhotoAfter,
      expectedPhoto,
      assertionsCounter,
    );
    assertionsCounter.checkAssertions();
  }

  async expectRejection(
    ...params: Parameters<typeof SharedTestUtils.prototype.expectRejection>
  ) {
    return await this.sharedTestUtils.expectRejection(...params);
  }

  async expectRejectionAndNoMetadataUpdate({
    expectedPhoto,
    fnExpectedToReject,
    fnParams,
    assertionsCounter,
  }: {
    expectedPhoto: IPhoto;
    fnExpectedToReject: Function;
    fnParams: unknown[];
    assertionsCounter: IAssertionsCounter;
  }) {
    await this.sharedTestUtils.expectRejection({
      fnExpectedToReject,
      fnParams,
      assertionsCounter,
    });
    await this.photoMetadataTestUtils.expectPhotoMetadataToBeInDb(
      expectedPhoto,
      assertionsCounter,
    );
    assertionsCounter.checkAssertions();
  }

  async expectPhotoMetadataToBeInDb(
    ...params: Parameters<
      typeof PhotoMetadataTestUtils.prototype.expectPhotoMetadataToBeInDb
    >
  ): Promise<void> {
    return await this.photoMetadataTestUtils.expectPhotoMetadataToBeInDb(
      ...params,
    );
  }
}
