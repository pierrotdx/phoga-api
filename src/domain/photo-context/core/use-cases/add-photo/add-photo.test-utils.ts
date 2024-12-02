import { IAssertionsCounter } from "@assertions-counter";
import { SharedTestUtils } from "@shared";

import {
  PhotoImageTestUtils,
  PhotoMetadataTestUtils,
} from "../../../../photo-context/";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";

export class AddPhotoTestUtils {
  private photoMetadataTestUtils: PhotoMetadataTestUtils;
  private photoImageTestUtils: PhotoImageTestUtils;
  private sharedTestUtils: SharedTestUtils;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  private testUtilsFactory(): void {
    this.sharedTestUtils = new SharedTestUtils();
    this.photoMetadataTestUtils = new PhotoMetadataTestUtils(
      this.photoMetadataDb,
      this.sharedTestUtils
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
