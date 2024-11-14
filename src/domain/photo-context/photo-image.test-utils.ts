import { IPhoto, IPhotoImageDb } from "@domain";
import { IAssertionsCounter, SharedTestUtils } from "@shared";

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
