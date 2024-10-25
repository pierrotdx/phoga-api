import { clone } from "ramda";

import { dumbPhotoGenerator } from "@adapters";
import { IPhoto, SortDirection } from "@business-logic";
import { DbsTestUtils, IDbsTestUtilsParams, comparePhotoDates } from "@utils";

export class SearchPhotoTestUtils extends DbsTestUtils {
  private readonly storedPhotos = this.generateStoredPhotos();

  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  private generateStoredPhotos() {
    const storedPhotos = [];
    const nbStoredPhotos = 3;
    for (let index = 0; index < nbStoredPhotos; index++) {
      const photo = dumbPhotoGenerator.generatePhoto();
      storedPhotos.push(photo);
    }
    return storedPhotos;
  }

  async init(): Promise<void> {
    await this.insertPhotosInDbs(this.storedPhotos);
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

  expectSearchResultToBeSortedAsRequired(
    searchResult: IPhoto[],
    requiredSortDirection: SortDirection,
  ): void {
    const expectedSortedList = this.getStoredPhotos(requiredSortDirection);
    expect(searchResult).toEqual(expectedSortedList);
    expect.assertions(1);
  }

  expectSearchResultSizeToMatchRequiredSize(
    searchResult: IPhoto[],
    requiredSize: number,
  ): void {
    expect(searchResult.length).toEqual(requiredSize);
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
