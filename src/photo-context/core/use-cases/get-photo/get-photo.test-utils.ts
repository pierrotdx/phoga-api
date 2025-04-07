import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import {
  GetPhotoField,
  IGetPhotoOptions,
  IGetPhotoUseCase,
  IPhoto,
} from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { GetPhotoUseCase } from "./get-photo";

export class GetPhotoTestUtils {
  private readonly testedUseCase: IGetPhotoUseCase;

  private readonly photoTestUtils: PhotoTestUtils;
  private readonly assertionsCounter: IAssertionsCounter;

  constructor(photoMetadataDb: IPhotoMetadataDb, photoImageDb: IPhotoImageDb) {
    this.testedUseCase = new GetPhotoUseCase(photoMetadataDb, photoImageDb);
    this.photoTestUtils = new PhotoTestUtils(photoMetadataDb, photoImageDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async executeTestedUseCase(
    id: IPhoto["_id"],
    options?: IGetPhotoOptions,
  ): Promise<IPhoto> {
    return await this.testedUseCase.execute(id, options);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    return await this.photoTestUtils.insertPhotoInDbs(photo);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    return await this.photoTestUtils.deletePhotoIfNecessary(id);
  }

  expectMatchingPhotos(expectedPhoto: IPhoto, result: IPhoto) {
    this.expectMatchingPhotoIds(expectedPhoto, result, this.assertionsCounter);
    this.expectMatchingPhotoMetadata(
      expectedPhoto,
      result,
      this.assertionsCounter,
    );
    this.expectMatchingPhotoImages(
      expectedPhoto,
      result,
      this.assertionsCounter,
    );
  }

  private expectMatchingPhotoIds(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(expectedPhoto._id).toBeDefined();
    expect(result._id).toBe(expectedPhoto._id);
    assertionsCounter.increase(2);
  }

  private expectMatchingPhotoMetadata(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (!expectedPhoto.metadata) {
      return;
    }
    expect(result.metadata).toEqual(expectedPhoto.metadata);
    assertionsCounter.increase();
  }

  private expectMatchingPhotoImages(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (!expectedPhoto.imageBuffer) {
      return;
    }
    this.photoTestUtils.expectMatchingPhotoImages(
      expectedPhoto,
      result,
      assertionsCounter,
    );
  }

  expectResultToHaveOnlyRequiredField(
    requiredField: GetPhotoField,
    result: IPhoto,
  ) {
    if (requiredField === GetPhotoField.Metadata) {
      expect(result.metadata).toBeDefined();
      expect(result.imageBuffer).toBeUndefined();
      this.assertionsCounter.increase(2);
    }
    if (requiredField === GetPhotoField.ImageBuffer) {
      expect(result.imageBuffer).toBeDefined();
      expect(result.metadata).toBeUndefined();
      this.assertionsCounter.increase(2);
    }
  }

  checkAssertions(): void {
    this.assertionsCounter.checkAssertions();
  }
}
