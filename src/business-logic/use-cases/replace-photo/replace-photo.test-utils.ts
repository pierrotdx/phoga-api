import { DbsTestUtils, IAssertionsCounter } from "@utils";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";

export class ReplacePhotoTestUtils extends DbsTestUtils {
  constructor(metadataDb?: IPhotoMetadataDb, imageDb?: IPhotoImageDb) {
    super(metadataDb, imageDb);
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

  async expectToMatchPhotoMetadata(
    id: IPhoto["_id"],
    expectedMetadata: IPhoto["metadata"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const metadataAfter = await this.getPhotoMetadataFromDb(id);
    expect(metadataAfter).toEqual(expectedMetadata);
    assertionsCounter.increase();
  }
}
