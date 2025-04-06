import { IAssertionsCounter } from "@shared/assertions-counter";

import { IPhotoMetadataDb } from "../gateways";
import { IPhoto } from "../models";
import { PhotoSharedTestUtils } from "./photo.shared-test-utils";

export class PhotoMetadataTestUtils {
  constructor(
    private readonly db: IPhotoMetadataDb,
    private readonly photoSharedTestUtils: PhotoSharedTestUtils,
  ) {}

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.db.getById(photo._id);
    this.photoSharedTestUtils.expectMatchingPhotosMetadata(
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
