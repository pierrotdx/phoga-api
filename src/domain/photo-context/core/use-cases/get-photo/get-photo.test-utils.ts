import { DbsTestUtils, IAssertionsCounter, SharedTestUtils } from "@shared";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { GetPhotoField, IPhoto } from "../../models";

export class GetPhotoTestUtils {
  private dbsTestUtils: DbsTestUtils;
  private sharedTestUtils: SharedTestUtils;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  private testUtilsFactory() {
    this.dbsTestUtils = new DbsTestUtils(
      this.photoMetadataDb,
      this.photoImageDb,
    );
    this.sharedTestUtils = new SharedTestUtils();
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    return await this.dbsTestUtils.insertPhotoInDbs(photo);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    return await this.dbsTestUtils.deletePhotoIfNecessary(id);
  }

  expectMatchingPhotos(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ) {
    this.expectMatchingPhotoIds(expectedPhoto, result, assertionsCounter);
    this.expectMatchingPhotoMetadata(expectedPhoto, result, assertionsCounter);
    this.expectMatchingPhotoImages(expectedPhoto, result, assertionsCounter);
  }

  private expectMatchingPhotoIds(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(expectedPhoto._id).toBeDefined();
    expect(result._id).toBe(expectedPhoto._id);
    assertionsCounter.increase(2);
  }

  private expectMatchingPhotoMetadata(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (!expectedPhoto.metadata) {
      return;
    }
    expect(result.metadata).toEqual(expectedPhoto.metadata);
    assertionsCounter.increase();
  }

  private expectMatchingPhotoImages(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (!expectedPhoto.imageBuffer) {
      return;
    }
    this.sharedTestUtils.expectMatchingBuffers(
      expectedPhoto.imageBuffer,
      result.imageBuffer,
      assertionsCounter,
    );
  }

  expectResultToHaveOnlyRequiredField(
    requiredField: GetPhotoField,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ) {
    if (requiredField === GetPhotoField.Metadata) {
      expect(result.metadata).toBeDefined();
      expect(result.imageBuffer).toBeUndefined();
      assertionsCounter.increase(2);
    }
    if (requiredField === GetPhotoField.ImageBuffer) {
      expect(result.imageBuffer).toBeDefined();
      expect(result.metadata).toBeUndefined();
      assertionsCounter.increase(2);
    }
  }
}
