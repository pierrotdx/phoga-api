import { clone } from "ramda";

import { IPhoto, SortDirection } from "@business-logic";
import { IDbsTestUtilsParams, comparePhotoDates } from "@utils";

import { UseCasesSharedTestUtils } from "../use-cases.shared-test-utils";

export class SearchPhotoTestUtils extends UseCasesSharedTestUtils {
  private storedPhotos: IPhoto[];

  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async init(photos: IPhoto[]): Promise<void> {
    this.setStoredPhotos(photos);
    await this.insertPhotosInDbs(this.storedPhotos);
  }

  public setStoredPhotos(photos: IPhoto[]): void {
    this.storedPhotos = clone(photos);
  }

  getStoredPhotos(sortDirection?: SortDirection): IPhoto[] {
    if (!sortDirection) {
      return this.storedPhotos;
    }
    const ascendingPhotos = clone(this.storedPhotos).sort(comparePhotoDates);
    return sortDirection === SortDirection.Ascending
      ? ascendingPhotos
      : ascendingPhotos.reverse();
  }

  expectSearchResultToMatchStoredPhotos(searchResult: IPhoto[]): void {
    expect(searchResult).toEqual(this.storedPhotos);
    expect.assertions(1);
  }

  expectSearchResultToStartFromRequiredIndex(
    searchResult: IPhoto[],
    requiredIndex: number,
  ): void {
    const matchingDocs = this.getStoredPhotos();
    const expectedFirstSearchResult = matchingDocs[requiredIndex];
    expect(searchResult[0]).toEqual(expectedFirstSearchResult);
    expect.assertions(1);
  }

  expectImagesToBeInSearchResultIfRequired(
    photos: IPhoto[],
    excludeImages: boolean,
  ) {
    photos.forEach((photo) => {
      if (excludeImages) {
        expect(photo.imageBuffer).toBeUndefined();
      } else {
        expect(photo.imageBuffer).toBeDefined();
      }
    });
    expect.assertions(photos.length);
  }
}
