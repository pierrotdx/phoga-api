import { IPhoto, IPhotoStoredData } from "#photo-context";
import { ISearchResult, SortDirection } from "#shared/models";

export interface IPhotoExpectsTestUtils {
  expectEqualPhotos(photo1: IPhoto, photo2: IPhoto): void;
  expectEqualSearchResults(expectedSearchResult: ISearchResult<IPhoto>, searchResult: ISearchResult<IPhoto>): void;
  expectPhotoStoredDataToBe(
    id: IPhoto["_id"],
    expectedValue: IPhotoStoredData,
  ): Promise<void>;
  expectPhotoImageToBe(
    id: IPhoto["_id"],
    expectedImageBuffer: IPhoto["imageBuffer"],
  ): Promise<void>;
  expectSubArrayToStartFromIndex(
    baseArray: IPhoto[],
    subArray: IPhoto[],
    startIndex: number,
  ): void;
  expectPhotosOrderToBe(photos: IPhoto[], dateOrdering: SortDirection): void;
  expectArraySizeToBeAtMost(photos: IPhoto[], size: number): void;
  increaseAssertionsCounter(value?: number): void;
  checkAssertions(): void;
}
