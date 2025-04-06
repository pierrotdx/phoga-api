import { IAssertionsCounter } from "@shared/assertions-counter";
import { SharedTestUtils } from "@shared/shared-test-utils";

import { IPhoto, IPhotoImageDb } from "..";

export class PhotoImageTestUtils {
  constructor(
    private readonly db: IPhotoImageDb,
    private readonly sharedTestUtils: SharedTestUtils,
  ) {}

  async expectPhotoImageToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbImage = await this.db.getById(photo._id);
    this.sharedTestUtils.expectMatchingBuffers(
      photo.imageBuffer,
      dbImage,
      assertionsCounter,
    );
  }

  expectMatchingPhotoImages(
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
}
