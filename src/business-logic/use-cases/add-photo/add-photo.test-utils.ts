import { DbsTestUtils, ICounter } from "@utils";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";

export class AddPhotoTestUtils extends DbsTestUtils {
  constructor(metadataDb?: IPhotoMetadataDb, imageDb?: IPhotoImageDb) {
    super(metadataDb, imageDb);
  }

  async expectImageToBeInDb(photo: IPhoto): Promise<void> {
    const dbImage = await this.getPhotoImageFromDb(photo._id);
    const isInDb = dbImage.compare(photo.imageBuffer as Buffer) === 0;
    expect(isInDb).toBe(true);
    expect.assertions(1);
  }

  async expectMetadataToBeInDb(photo: IPhoto): Promise<void> {
    const dbMetadata = await this.getPhotoMetadataFromDb(photo._id);
    expect(dbMetadata).toEqual(photo.metadata);
    expect.assertions(1);
  }

  async expectMetadataNotToBeInDb(
    id: IPhoto["_id"],
    assertionsCounter: ICounter,
  ): Promise<void> {
    const dbMetadata = await this.getPhotoMetadataFromDb(id);
    expect(dbMetadata).toBeUndefined();
    assertionsCounter.increase();
  }
}
