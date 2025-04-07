import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto, IReplacePhotoUseCase } from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { ReplacePhotoUseCase } from "./replace-photo";

export class ReplacePhotoTestUtils {
  private readonly testedUseCase: IReplacePhotoUseCase;

  private readonly photoTestUtils: PhotoTestUtils;
  private readonly assertionsCounter: IAssertionsCounter;

  constructor(photoMetadataDb: IPhotoMetadataDb, photoImageDb: IPhotoImageDb) {
    this.testedUseCase = new ReplacePhotoUseCase(photoMetadataDb, photoImageDb);
    this.photoTestUtils = new PhotoTestUtils(photoMetadataDb, photoImageDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async executeTestedUseCase(photo: IPhoto): Promise<void> {
    await this.testedUseCase.execute(photo);
  }

  async insertPhotoInDb(photo: IPhoto): Promise<void> {
    return await this.photoTestUtils.insertPhotoInDbs(photo);
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.photoTestUtils.getPhotoFromDb(id);
  }

  async deletePhotoMetadata(id: IPhoto["_id"]): Promise<void> {
    return await this.photoTestUtils.deletePhotoMetadata(id);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    return await this.photoTestUtils.deletePhotoIfNecessary(id);
  }

  async executeUseCaseAndExpectToThrow(photo: IPhoto): Promise<void> {
    try {
      await this.executeTestedUseCase(photo);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase();
    }
  }

  async expectPhotoToBeReplacedInDb(
    dbPhotoBefore: IPhoto,
    expectedPhoto: IPhoto,
  ): Promise<void> {
    const dbPhotoAfter = await this.getPhotoFromDb(dbPhotoBefore._id);

    expect(dbPhotoAfter).toBeDefined();
    expect(dbPhotoBefore).toBeDefined();
    expect(dbPhotoAfter).not.toEqual(dbPhotoBefore);
    this.assertionsCounter.increase(3);

    this.photoTestUtils.expectMatchingPhotos(
      dbPhotoAfter,
      expectedPhoto,
      this.assertionsCounter,
    );

    this.assertionsCounter.checkAssertions();
  }

  async expectPhotoMetadataToBeInDb(expectedPhoto: IPhoto): Promise<void> {
    await this.photoTestUtils.expectPhotoMetadataToBeInDb(
      expectedPhoto,
      this.assertionsCounter,
    );
    this.assertionsCounter.checkAssertions();
  }
}
