import {
  compareDates,
  DbsTestUtils,
  IAssertionsCounter,
  IDbsTestUtilsParams,
  sharedTestUtils,
} from "@utils";

import { IPhoto, SortDirection } from "../models";

export class UseCasesSharedTestUtils extends DbsTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.getPhotoMetadataFromDb(photo._id);
    expect(dbMetadata).toEqual(photo.metadata);
    assertionsCounter.increase();
  }

  expectMatchingPhotos(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ) {
    this.expectMatchingPhotoIds(expectedPhoto, result, assertionsCounter);
    this.expectMatchingPhotoMetadata(expectedPhoto, result, assertionsCounter);
    this.expectMatchingPhotoImages(expectedPhoto, result, assertionsCounter);
  }

  expectMatchingPhotoIds(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(expectedPhoto._id).toBeDefined();
    expect(result._id).toBe(expectedPhoto._id);
    assertionsCounter.increase(2);
  }

  expectMatchingPhotoMetadata(
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

  expectMatchingPhotoImages(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (!expectedPhoto.imageBuffer) {
      return;
    }
    sharedTestUtils.expectMatchingBuffers(
      expectedPhoto.imageBuffer,
      result.imageBuffer,
      assertionsCounter,
    );
  }

  expectSearchResultMatchingSize(
    searchResult: any[],
    size: number,
    assertionsCounter: IAssertionsCounter,
  ) {
    expect(searchResult.length).toBeLessThanOrEqual(size);
    assertionsCounter.increase();
  }

  expectSearchResultMatchingDateOrdering(
    searchResult: any[],
    dateOrdering: SortDirection,
    assertionsCounter: IAssertionsCounter,
  ) {
    const searchResultDates = searchResult.map((data) => {
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
    assertionsCounter.increase();
  }
}
