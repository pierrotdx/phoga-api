import { IAssertionsCounter, IDbsTestUtilsParams } from "@utils";

import { IPhoto } from "../../models";
import { UseCasesSharedTestUtils } from "../use-cases.shared-test-utils";

export class AddPhotoTestUtils extends UseCasesSharedTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async expectPhotoImageToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbImage = await this.getPhotoImageFromDb(photo._id);
    const isInDb = dbImage.compare(photo.imageBuffer as Buffer) === 0;
    expect(isInDb).toBe(true);
    assertionsCounter.increase();
  }

  async expectMetadataNotToBeInDb(
    id: IPhoto["_id"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.getPhotoMetadataFromDb(id);
    expect(dbMetadata).toBeUndefined();
    assertionsCounter.increase();
  }
}
