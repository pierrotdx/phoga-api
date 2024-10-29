import { IDbsTestUtilsParams } from "@utils";

import { IPhoto } from "../../models";
import { UseCasesSharedTestUtils } from "../use-cases.shared-test-utils";

export class ReplacePhotoTestUtils extends UseCasesSharedTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async expectImageToBeReplacedInDb(
    dbImageBefore: IPhoto["imageBuffer"],
    expectedImage: IPhoto["imageBuffer"],
    id: IPhoto["_id"],
  ): Promise<void> {
    const dbImageAfter = await this.getPhotoImageFromDb(id);
    expect(dbImageAfter).toEqual(expectedImage);
    expect(dbImageAfter).not.toEqual(dbImageBefore);
    expect.assertions(2);
  }

  async expectMetadataToBeReplacedInDb(
    id: IPhoto["_id"],
    dbMetadataBefore: IPhoto["metadata"],
    expectedMetadata: IPhoto["metadata"],
  ): Promise<void> {
    const dbMetadataAfter = await this.getPhotoMetadataFromDb(id);

    expect(dbMetadataAfter).toEqual(expectedMetadata);
    expect(dbMetadataAfter).not.toEqual(dbMetadataBefore);

    expect(dbMetadataBefore.location).toBeDefined();
    expect(dbMetadataAfter.location).not.toEqual(dbMetadataBefore.location);

    expect(dbMetadataBefore.titles).toBeDefined();
    expect(dbMetadataAfter.titles).not.toEqual(dbMetadataBefore.titles);

    expect.assertions(6);
  }
}
