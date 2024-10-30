import {
  IAssertionsCounter,
  IDbsTestUtilsParams,
  sharedTestUtils,
} from "@utils";

import { IPhoto } from "../../models";
import { UseCasesSharedTestUtils } from "../use-cases.shared-test-utils";

export class ReplacePhotoTestUtils extends UseCasesSharedTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async expectImageToBeReplacedInDb(
    dbImageBefore: IPhoto["imageBuffer"],
    expectedPhoto: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbImageAfter = await this.getPhotoImageFromDb(expectedPhoto._id);
    expect(dbImageAfter).not.toEqual(dbImageBefore);
    assertionsCounter.increase(1);
    sharedTestUtils.expectMatchingBuffers(
      dbImageAfter,
      expectedPhoto.imageBuffer,
      assertionsCounter,
    );
  }

  async expectMetadataToBeReplacedInDb(
    dbMetadataBefore: IPhoto["metadata"],
    expectedPhoto: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadataAfter = await this.getPhotoMetadataFromDb(
      expectedPhoto._id,
    );
    expect(dbMetadataAfter).not.toEqual(dbMetadataBefore);
    expect(dbMetadataAfter).toEqual(expectedPhoto.metadata);
    assertionsCounter.increase(2);
  }
}
