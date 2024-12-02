import { IAssertionsCounter } from "@assertions-counter";
import { IPhoto, IPhotoMetadataDb } from "@domain";
import { ISharedTestUtils } from "@shared";

export class PhotoMetadataTestUtils {
  constructor(
    private readonly db: IPhotoMetadataDb,
    private readonly sharedTestUtils: ISharedTestUtils,
  ) {}

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.db.getById(photo._id);
    this.sharedTestUtils.expectMatchingPhotosMetadata(
      photo.metadata,
      dbMetadata,
      assertionsCounter,
    );
  }

  async expectMetadataNotToBeInDb(
    id: IPhoto["_id"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.db.getById(id);
    expect(dbMetadata).toBeUndefined();
    assertionsCounter.increase();
  }
}
