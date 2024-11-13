import { DbsTestUtils, IAssertionsCounter, compareDates } from "@utils";

import { IPhoto, SortDirection } from "../models";

export class UseCasesSharedTestUtils {
  constructor(private readonly dbsTestUtils: DbsTestUtils) {}

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.dbsTestUtils.getPhotoMetadataFromDb(
      photo._id,
    );
    expect(dbMetadata).toEqual(photo.metadata);
    assertionsCounter.increase();
  }
}
