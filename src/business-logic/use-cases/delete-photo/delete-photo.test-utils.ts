import { DbsTestUtils, IAssertionsCounter, IDbsTestUtilsParams } from "@utils";

import { IPhoto } from "../../models";

export class DeletePhotoTestUtils extends DbsTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async expectMetadataToBeDeletedFromDb(
    dbMetadataBeforeDelete: IPhoto["metadata"],
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    expect(dbMetadataBeforeDelete).toBeDefined();
    expect(dbMetadataBeforeDelete).toEqual(photo.metadata);

    const dbMetadataAfterDelete = await this.getPhotoMetadataFromDb(photo._id);
    expect(dbMetadataAfterDelete).toBeUndefined();

    assertionsCounter.increase(3);
  }

  async expectMetadataNotToBeDeleted(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const metadataFromDb = await this.getPhotoMetadataFromDb(photo._id);
    expect(metadataFromDb).toBeDefined();
    expect(metadataFromDb).toEqual(photo.metadata);
    assertionsCounter.increase(2);
  }

  async expectImageToBeDeletedFromDb(
    dbImageBeforeDelete: IPhoto["imageBuffer"],
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    expect(dbImageBeforeDelete).toBeDefined();
    expect(dbImageBeforeDelete).toEqual(photo.imageBuffer);

    const dbImageAfterDelete = await this.getPhotoImageFromDb(photo._id);
    expect(dbImageAfterDelete).toBeUndefined();

    assertionsCounter.increase(3);
  }
}
