import { DbsTestUtils, ICounter } from "@utils";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";

export class DeletePhotoTestUtils extends DbsTestUtils {
  constructor(metadataDb?: IPhotoMetadataDb, imageDb?: IPhotoImageDb) {
    super(metadataDb, imageDb);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.deletePhotoInDbs(id);
    } catch (err) {}
  }

  async expectMetadataToBeDeletedFromDb(
    dbMetadataBeforeDelete: IPhoto["metadata"],
    photo: IPhoto,
  ): Promise<void> {
    expect(dbMetadataBeforeDelete).toBeDefined();
    expect(dbMetadataBeforeDelete).toEqual(photo.metadata);

    const dbMetadataAfterDelete = await this.getPhotoMetadataFromDb(photo._id);
    expect(dbMetadataAfterDelete).toBeUndefined();

    expect.assertions(3);
  }

  async expectMetadataNotToBeDeleted(
    photo: IPhoto,
    assertionsCounter: ICounter,
  ): Promise<void> {
    const metadataFromDb = await this.getPhotoMetadataFromDb(photo._id);
    expect(metadataFromDb).toBeDefined();
    expect(metadataFromDb).toEqual(photo.metadata);
    assertionsCounter.increase(2);
  }

  async expectImageToBeDeletedFromDb(
    dbImageBeforeDelete: IPhoto["imageBuffer"],
    photo: IPhoto,
  ): Promise<void> {
    expect(dbImageBeforeDelete).toBeDefined();
    expect(dbImageBeforeDelete).toEqual(photo.imageBuffer);

    const dbImageAfterDelete = await this.getPhotoImageFromDb(photo._id);
    expect(dbImageAfterDelete).toBeUndefined();

    expect.assertions(3);
  }
}
