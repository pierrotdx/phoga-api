import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { compareDates } from "#shared/compare-dates";
import {
  ErrorWithStatus,
  HttpErrorCode,
  IUseCase,
  SortDirection,
} from "#shared/models";
import { omit } from "ramda";

import { IPhotoDataDb, IPhotoImageDb } from "../gateways";
import {
  IPhoto,
  IPhotoData,
  IPhotoStoredData,
  IReplacePhotoParams,
} from "../models";
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
    this.expectMatchingIds(photo1, photo1);
    this.expectMatchingPhotoBases(photo1, photo2);
    this.expectMatchingPhotoImages(photo1, photo2);
  }

  private expectMatchingIds(photo1: IPhoto, photo2: IPhoto): void {
    expect(photo1._id).toEqual(photo2._id);
    this.assertionsCounter.increase();
  }

  private expectMatchingPhotoBases(photo1: IPhoto, photo2: IPhoto): void {
    const photoData1 = this.getPhotoData(photo1);
    const photoData2 = this.getPhotoData(photo2);
    expect(photoData2).toEqual(photoData1);
    this.assertionsCounter.increase();
  }

  getPhotoData(photo: IPhoto): IPhotoData {
    return omit(["imageBuffer"], photo);
  }

  async expectPhotoStoredDataToBe(
    id: IPhoto["_id"],
    expectedValue: IPhotoStoredData,
  ): Promise<void> {
    const storedPhotoData = await this.getPhotoStoredDataFromDb(id);
    expect(storedPhotoData).toEqual(expectedValue);
    this.assertionsCounter.increase();
  }

  async expectPhotoStoredImageToBe(
    id: IPhoto["_id"],
    expectedImageBuffer: IPhoto["imageBuffer"],
  ): Promise<void> {
    const dbImage = await this.getPhotoImageFromDb(id);
    if (!expectedImageBuffer) {
      expect(dbImage).toBeFalsy();
      this.assertionsCounter.increase();
      return;
    }
    this.expectMatchingBuffers(expectedImageBuffer, dbImage);
  }

  private expectMatchingPhotoImages(photo1: IPhoto, photo2: IPhoto): void {
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
    const photoData = this.getPhotoData(photo);
    await this.expectPhotoStoredDataToBe(photo._id, photoData);
    await this.expectPhotoStoredImageToBe(photo._id, photo.imageBuffer);
  }

  async executeUseCaseAndExpectToThrow({
    useCaseParams,
    expectedStatus,
  }: {
    expectedStatus?: HttpErrorCode;
    useCaseParams: unknown[];
  }): Promise<void> {
    try {
      await this.testedUseCase.execute(...useCaseParams);
    } catch (err) {
      expect(err).toBeDefined();
      if (expectedStatus) {
        const error = err as ErrorWithStatus;
        expect(error.status).toBe(expectedStatus);
      }
    } finally {
      this.assertionsCounter.increase();
      if (expectedStatus) {
        this.assertionsCounter.increase();
      }
    }
  }

  async expectPhotoToBeDeletedFromDbs(id: IPhoto["_id"]): Promise<void> {
    await this.expectPhotoStoredDataToBe(id, undefined);
    await this.expectPhotoStoredImageToBe(id, undefined);
  }

  async expectPhotoToBeReplacedInDb(
    id: IPhoto["_id"],
    expectedDbData: IReplacePhotoParams,
  ): Promise<void> {
    const photoStoredData: IPhotoStoredData = omit(
      ["imageBuffer"],
      expectedDbData,
    );
    await this.expectPhotoStoredDataToBe(id, photoStoredData);
    await this.expectPhotoStoredImageToBe(id, expectedDbData.imageBuffer);
  }

  expectEqualPhotoArrays(photos1: IPhoto[], photos2: IPhoto[]): void {
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

  expectArraySizeToBeAtMost(photos: IPhoto[], size: number) {
    expect(photos.length).toBeLessThanOrEqual(size);
    this.assertionsCounter.increase();
  }

  checkAssertions(): void {
    this.assertionsCounter.checkAssertions();
  }
}
