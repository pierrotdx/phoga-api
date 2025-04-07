import { clone } from "ramda";

import {
  AssertionsCounter,
  IAssertionsCounter,
} from "@shared/assertions-counter";
import { compareDates } from "@shared/compare-dates";
import { SortDirection } from "@shared/models";

import { dumbPhotoGenerator } from "../../../adapters/";
import {
  IPhoto,
  ISearchPhotoOptions,
  ISearchPhotoUseCase,
} from "../../../core/models";
import { comparePhotoDates } from "../../compare-photos";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { PhotoTestUtils } from "../../test-utils";
import { SearchPhotoUseCase } from "./search-photo";

export class SearchPhotoTestUtils {
  private readonly testedUseCase: ISearchPhotoUseCase;

  private readonly photoTestUtils: PhotoTestUtils;
  private readonly assertionsCounter: IAssertionsCounter;

  private readonly dumbPhotoGenerator = dumbPhotoGenerator;
  private storedPhotos: IPhoto[] = [];

  constructor(photoMetadataDb: IPhotoMetadataDb, photoImageDb: IPhotoImageDb) {
    this.testedUseCase = new SearchPhotoUseCase(photoMetadataDb, photoImageDb);
    this.photoTestUtils = new PhotoTestUtils(photoMetadataDb, photoImageDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async initStoredPhotos(nbStoredPhotos: number): Promise<void> {
    const photos = await this.dumbPhotoGenerator.generatePhotos(nbStoredPhotos);
    this.setStoredPhotos(photos);
    await this.photoTestUtils.insertPhotosInDbs(this.storedPhotos);
  }

  public setStoredPhotos(photos: IPhoto[]): void {
    this.storedPhotos = clone(photos);
  }

  async executeTestedUseCase(
    searchPhotoOptions?: ISearchPhotoOptions,
  ): Promise<IPhoto[]> {
    return await this.testedUseCase.execute(searchPhotoOptions);
  }

  async clearStoredPhotos(): Promise<void> {
    const promises = this.storedPhotos.map(async (photo) => {
      await this.photoTestUtils.deletePhotoIfNecessary(photo._id);
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
    this.assertionsCounter.increase();
    this.assertionsCounter.checkAssertions();
  }

  expectSearchResultToStartFromRequiredIndex(
    searchResult: IPhoto[],
    requiredIndex: number,
  ): void {
    const matchingDocs = this.getStoredPhotos();
    const expectedFirstSearchResult = matchingDocs[requiredIndex];

    expect(searchResult[0]).toEqual(expectedFirstSearchResult);
    this.assertionsCounter.increase();

    this.assertionsCounter.checkAssertions();
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
    this.assertionsCounter.increase(photos.length);
    this.assertionsCounter.checkAssertions();
  }

  expectSearchResultMatchingDateOrdering(
    searchResult: any[],
    dateOrdering: SortDirection,
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
    this.assertionsCounter.increase();
    this.assertionsCounter.checkAssertions();
  }

  expectSearchResultMatchingSize(searchResult: any[], size: number) {
    expect(searchResult.length).toBeLessThanOrEqual(size);
    this.assertionsCounter.increase();
    this.assertionsCounter.checkAssertions();
  }
}
