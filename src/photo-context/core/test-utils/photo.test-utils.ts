import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { compareDates } from "#shared/compare-dates";
import { IUseCase, SortDirection } from "#shared/models";
import { omit } from "ramda";

import { IPhotoBaseDb, IPhotoImageDb } from "../gateways";
import { GetPhotoField, IPhoto, IPhotoBase } from "../models";
import { DbPhotoTestUtils } from "./db-photo.test-utils";

export class PhotoTestUtils<TUseCaseResult = unknown> extends DbPhotoTestUtils {
  protected readonly assertionsCounter: IAssertionsCounter =
    new AssertionsCounter();

  constructor(
    photoBaseDb?: IPhotoBaseDb,
    photoImageDb?: IPhotoImageDb,
    protected testedUseCase?: IUseCase<TUseCaseResult>,
  ) {
    super(photoBaseDb, photoImageDb);
  }

  executeTestedUseCase = async (...args: unknown[]): Promise<TUseCaseResult> =>
    await this.testedUseCase.execute(...args);

  expectMatchingPhotos(photo1: IPhoto, photo2: IPhoto): void {
    expect(photo1._id).toEqual(photo2._id);
    this.assertionsCounter.increase();
    this.expectMatchingPhotoBases(photo1, photo2);
    this.expectMatchingPhotoImages(photo1, photo2);
  }

  expectMatchingPhotoBases(
    storePhoto1: IPhotoBase,
    storePhoto2: IPhotoBase,
  ): void {
    expect(storePhoto1).toEqual(storePhoto2);
    this.assertionsCounter.increase();
  }

  async expectPhotoBaseToBeInDb(photo: IPhoto): Promise<void> {
    const photoBase: IPhotoBase = omit(["imageBuffer"], photo);
    const dbPhotoBase = await this.getPhotoBaseFromDb(photo._id);
    this.expectMatchingPhotoBases(photoBase, dbPhotoBase);
  }

  async expectPhotoImageToBeInDb(photo: IPhoto): Promise<void> {
    const dbImage = await this.getPhotoImageFromDb(photo._id);
    this.expectMatchingBuffers(photo.imageBuffer, dbImage);
  }

  expectMatchingPhotoImages(photo1: IPhoto, photo2: IPhoto): void {
    if (!photo1.imageBuffer || !photo2.imageBuffer) {
      return;
    }
    this.expectMatchingBuffers(photo1.imageBuffer, photo2.imageBuffer);
  }

  private expectMatchingBuffers(bufferA: Buffer, bufferB: Buffer) {
    const areEqualBuffers = bufferA.equals(bufferB);
    expect(areEqualBuffers).toBe(true);
    this.assertionsCounter.increase();
  }

  async expectPhotoToBeUploaded(photo: IPhoto): Promise<void> {
    await this.expectPhotoBaseToBeInDb(photo);
    await this.expectPhotoImageToBeInDb(photo);
  }

  async executeUseCaseAndExpectToThrow(
    ...useCaseParams: unknown[]
  ): Promise<void> {
    try {
      await this.testedUseCase.execute(useCaseParams);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase();
    }
  }

  async expectPhotoToBeDeletedFromDbs(id: IPhoto["_id"]): Promise<void> {
    const photo = await this.getPhotoFromDb(id);
    expect(photo.imageBuffer).toBeUndefined();
    expect(photo.metadata).toBeUndefined();
    this.assertionsCounter.increase(2);
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

    this.expectMatchingPhotos(dbPhotoAfter, expectedPhoto);
  }

  expectPhotoToHaveOnlyRequiredField(
    photo: IPhoto,
    requiredField: GetPhotoField,
  ) {
    if (requiredField === GetPhotoField.Base) {
      expect(photo.metadata).toBeDefined();
      expect(photo.imageBuffer).toBeUndefined();
      this.assertionsCounter.increase(2);
    }
    if (requiredField === GetPhotoField.ImageBuffer) {
      expect(photo.imageBuffer).toBeDefined();
      expect(photo.metadata).toBeUndefined();
      this.assertionsCounter.increase(2);
    }
  }

  expectMatchingPhotoArrays(photos1: IPhoto[], photos2: IPhoto[]): void {
    expect(photos1).toEqual(photos2);
    this.assertionsCounter.increase();
  }

  expectSubArrayToStartFromIndex(
    baseArray: IPhoto[],
    subArray: IPhoto[],
    requiredIndex: number,
  ): void {
    const expectedFirstSearchResult = baseArray[requiredIndex];

    expect(subArray[0]).toEqual(expectedFirstSearchResult);
    this.assertionsCounter.increase();
  }

  expectImagesToBeInPhotosIfRequired(photos: IPhoto[], excludeImages: boolean) {
    photos.forEach((photo) => {
      if (excludeImages) {
        expect(photo.imageBuffer).toBeUndefined();
      } else {
        expect(photo.imageBuffer).toBeDefined();
      }
    });
    this.assertionsCounter.increase(photos.length);
  }

  expectPhotosOrderToBe(photos: IPhoto[], dateOrdering: SortDirection) {
    const searchResultDates = photos.map((data) => {
      const stringDate = data.metadata?.date;
      if (stringDate) {
        return new Date(stringDate);
      }
    });
    const orderedDates = [...searchResultDates].sort(compareDates);
    if (dateOrdering === SortDirection.Descending) {
      orderedDates.reverse();
    }
    expect(searchResultDates).toEqual(orderedDates);
    this.assertionsCounter.increase();
  }

  expectPhotosArraySizeToBe(photos: IPhoto[], size: number) {
    expect(photos.length).toBeLessThanOrEqual(size);
    this.assertionsCounter.increase();
  }

  async expectPhotoBaseNotToBeDeleted(photo: IPhoto): Promise<void> {
    const photoBaseFromDb = await this.getPhotoBaseFromDb(photo._id);
    expect(photoBaseFromDb).toBeDefined();
    const photoBase = omit(["imageBuffer"], photo);
    expect(photoBaseFromDb).toEqual(photoBase);
    this.assertionsCounter.increase(2);
  }

  checkAssertions(): void {
    this.assertionsCounter.checkAssertions();
  }
}
