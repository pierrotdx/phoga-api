import { IAssertionsCounter } from "@shared/assertions-counter";
import { SharedTestUtils } from "@shared/shared-test-utils";

import { IPhoto } from "../models";

export class PhotoSharedTestUtils {
  constructor(private readonly sharedTestUtils: SharedTestUtils) {}

  expectMatchingPhotos(
    photo1: IPhoto,
    photo2: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(photo1._id).toEqual(photo2._id);
    assertionsCounter.increase();
    this.expectMatchingPhotosMetadata(
      photo1.metadata,
      photo2.metadata,
      assertionsCounter,
    );
    this.sharedTestUtils.expectMatchingBuffers(
      photo1.imageBuffer,
      photo2.imageBuffer,
      assertionsCounter,
    );
  }

  expectMatchingPhotosMetadata(
    photoMetadata1: IPhoto["metadata"],
    photoMetadata2: IPhoto["metadata"],
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(photoMetadata1).toEqual(photoMetadata2);
    assertionsCounter.increase();
  }
}
