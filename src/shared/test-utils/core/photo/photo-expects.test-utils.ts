import { IPhoto, IPhotoData, IPhotoStoredData } from "#photo-context";
import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { compareDates } from "#shared/compare-dates";
import { SortDirection } from "#shared/models";
import { equals, omit } from "ramda";

import { IPhotoDbTestUtils, IPhotoExpectsTestUtils } from "../models";

export class PhotoExpectsTestUtils implements IPhotoExpectsTestUtils {
  protected readonly assertionsCounter: IAssertionsCounter =
    new AssertionsCounter();

  constructor(protected readonly photoDbTestUtils: IPhotoDbTestUtils) {}

  expectEqualPhotos(photo1: IPhoto, photo2: IPhoto): void {
    this.expectMatchingIds(photo1, photo1);
    this.expectMatchingPhotosData(photo1, photo2);
    this.expectMatchingPhotoImages(photo1, photo2);
  }

  private expectMatchingIds(photo1: IPhoto, photo2: IPhoto): void {
    expect(photo1._id).toEqual(photo2._id);
    this.assertionsCounter.increase();
  }

  private expectMatchingPhotosData(photo1: IPhoto, photo2: IPhoto): void {
    const photoData1 = this.extractPhotoData(photo1);
    const photoData2 = this.extractPhotoData(photo2);
    expect(photoData2).toEqual(photoData1);
    this.assertionsCounter.increase();
  }

  private extractPhotoData(photo: IPhoto): IPhotoData {
    return omit(["imageBuffer"], photo);
  }

  async expectPhotoStoredDataToBe(
    id: IPhoto["_id"],
    expectedValue: IPhotoStoredData,
  ): Promise<void> {
    const storedPhotoData = await this.photoDbTestUtils.getPhotoStoredData(id);
    expect(storedPhotoData).toEqual(expectedValue);
    this.assertionsCounter.increase();
  }

  async expectPhotoImageToBe(
    id: IPhoto["_id"],
    expectedImageBuffer: IPhoto["imageBuffer"],
  ): Promise<void> {
    const dbImage = await this.photoDbTestUtils.getPhotoImage(id);
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

  private expectMatchingBuffers = (bufferA: Buffer, bufferB: Buffer) => {
    const areEqualBuffers = bufferA.equals(bufferB);
    expect(areEqualBuffers).toBe(true);
    this.assertionsCounter.increase();
  };

  expectEqualPhotoArrays(photos1: IPhoto[], photos2: IPhoto[]): void {
    expect(photos1.length).toEqual(photos2.length);
    this.assertionsCounter.increase();

    photos1.forEach((photo1) => {
      const isInPhotos2 = photos2.some((photo2) => equals(photo1, photo2));
      expect(isInPhotos2).toBe(true);
      this.assertionsCounter.increase();
    });
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
    const photosDates = photos.map((photo) => photo.metadata?.date);
    const orderedDates = [...photosDates].sort(compareDates);
    if (dateOrdering === SortDirection.Descending) {
      orderedDates.reverse();
    }
    expect(photosDates).toEqual(orderedDates);
    this.assertionsCounter.increase();
  }

  expectArraySizeToBeAtMost(photos: IPhoto[], size: number): void {
    expect(photos.length).toBeLessThanOrEqual(size);
    this.assertionsCounter.increase();
  }

  increaseAssertionsCounter(value?: number): void {
    this.assertionsCounter.increase(value);
  }

  checkAssertions(): void {
    this.assertionsCounter.checkAssertions();
  }
}
