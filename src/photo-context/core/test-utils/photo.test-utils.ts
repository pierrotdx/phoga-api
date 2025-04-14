import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { compareDates } from "#shared/compare-dates";
import { IUseCase, SortDirection } from "#shared/models";
import { omit } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../gateways";
import { GetPhotoField, IPhoto, IPhotoData } from "../models";
import { DbPhotoTestUtils } from "./db-photo.test-utils";

export class PhotoTestUtils<TUseCaseResult = unknown> extends DbPhotoTestUtils {
  protected readonly assertionsCounter: IAssertionsCounter =
    new AssertionsCounter();

  constructor(
    photoDataDb?: IPhotoDataDb,
    photoImageDb?: IPhotoImageDb,
    protected testedUseCase?: IUseCase<TUseCaseResult>,
  ) {
    super(photoDataDb, photoImageDb);
  }

  executeTestedUseCase = async (...args: unknown[]): Promise<TUseCaseResult> =>
    await this.testedUseCase.execute(...args);

  expectMatchingPhotos(photo1: IPhoto, photo2: IPhoto): void {
    expect(photo1._id).toEqual(photo2._id);
    this.assertionsCounter.increase();
    this.expectMatchingPhotoDatas(photo1, photo2);
    this.expectMatchingPhotoImages(photo1, photo2);
  }

  expectMatchingPhotoDatas(photo1: IPhoto, photo2: IPhoto): void {
    const photoData1 = this.convertToPhotoData(photo1);
    const photoData2 = this.convertToPhotoData(photo2);
    expect(photoData1).toEqual(photoData2);
    this.assertionsCounter.increase();
  }

  private convertToPhotoData(photo: IPhoto): IPhotoData {
    const photoData: IPhotoData = omit(["imageBuffer"], photo);
    return photoData;
  }

  async expectPhotoDataToBeInDb(photo: IPhoto): Promise<void> {
    const photoData: IPhotoData = this.convertToPhotoData(photo);
    const dbPhotoData = await this.getPhotoDataStoreFromDb(photo._id);
    this.expectMatchingPhotoDatas(photoData, dbPhotoData);
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
    await this.expectPhotoDataToBeInDb(photo);
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

  async expectPhotoDataNotToBeDeleted(photo: IPhoto): Promise<void> {
    const photoDataFromDb = await this.getPhotoDataStoreFromDb(photo._id);
    expect(photoDataFromDb).toBeDefined();
    const photoData = omit(["imageBuffer"], photo);
    expect(photoDataFromDb).toEqual(photoData);
    this.assertionsCounter.increase(2);
  }

  checkAssertions(): void {
    this.assertionsCounter.checkAssertions();
  }
}
