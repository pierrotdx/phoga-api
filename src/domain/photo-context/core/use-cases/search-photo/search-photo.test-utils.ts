import { clone } from "ramda";

import {
  DbsTestUtils,
  IAssertionsCounter,
  compareDates,
  comparePhotoDates,
} from "@shared";

import { IPhoto, SortDirection } from "../../../core";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";

export class SearchPhotoTestUtils {
  private storedPhotos: IPhoto[];
  private dbsTestUtils: DbsTestUtils;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  private testUtilsFactory() {
    this.dbsTestUtils = new DbsTestUtils(
      this.photoMetadataDb,
      this.photoImageDb,
    );
  }

  async initStoredPhotos(photos: IPhoto[]): Promise<void> {
    this.setStoredPhotos(photos);
    await this.dbsTestUtils.insertPhotosInDbs(this.storedPhotos);
  }

  public setStoredPhotos(photos: IPhoto[]): void {
    this.storedPhotos = clone(photos);
  }

  async clearStoredPhotos(): Promise<void> {
    const promises = this.storedPhotos.map(async (photo) => {
      await this.dbsTestUtils.deletePhotoIfNecessary(photo._id);
    });
    await Promise.all(promises);
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

  expectSearchResultMatchingSize(
    searchResult: any[],
    size: number,
    assertionsCounter: IAssertionsCounter,
  ) {
    expect(searchResult.length).toBeLessThanOrEqual(size);
    assertionsCounter.increase();
  }
}
