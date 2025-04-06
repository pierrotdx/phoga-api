import { IAssertionsCounter } from "@shared/assertions-counter";
import { SharedTestUtils } from "@shared/shared-test-utils";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";
import {
  PhotoImageTestUtils,
  PhotoMetadataTestUtils,
  PhotoSharedTestUtils,
} from "../../test-utils";

export class AddPhotoTestUtils {
  private photoMetadataTestUtils: PhotoMetadataTestUtils;
  private photoImageTestUtils: PhotoImageTestUtils;
  private sharedTestUtils: SharedTestUtils;
  private photoSharedTestUtils: PhotoSharedTestUtils;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  private testUtilsFactory(): void {
    this.sharedTestUtils = new SharedTestUtils();
    this.photoSharedTestUtils = new PhotoSharedTestUtils(this.sharedTestUtils);
    this.photoMetadataTestUtils = new PhotoMetadataTestUtils(
      this.photoMetadataDb,
      this.photoSharedTestUtils,
    );
    this.photoImageTestUtils = new PhotoImageTestUtils(
      this.photoImageDb,
      this.sharedTestUtils,
    );
  }

  async expectPhotoToBeUploaded(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    await this.photoMetadataTestUtils.expectPhotoMetadataToBeInDb(
      photo,
      assertionsCounter,
    );
    await this.photoImageTestUtils.expectPhotoImageToBeInDb(
      photo,
      assertionsCounter,
    );
    assertionsCounter.checkAssertions();
  }

  async expectThrowAndNoMetadataUpdate({
    fnExpectedToReject,
    fnParams,
    photo,
    assertionsCounter,
  }: {
    fnExpectedToReject: Function;
    fnParams: unknown[];
    photo: IPhoto;
    assertionsCounter: IAssertionsCounter;
  }) {
    await this.sharedTestUtils.expectRejection({
      fnExpectedToReject,
      fnParams,
      assertionsCounter,
    });
    await this.photoMetadataTestUtils.expectMetadataNotToBeInDb(
      photo._id,
      assertionsCounter,
    );
    assertionsCounter.checkAssertions();
  }
}
