import { DbsTestUtils, IAssertionsCounter, IDbsTestUtilsParams } from "@utils";

import { IPhoto } from "../models";

export class UseCasesSharedTestUtils extends DbsTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.getPhotoMetadataFromDb(photo._id);
    expect(dbMetadata).toEqual(photo.metadata);
    assertionsCounter.increase();
  }
}
