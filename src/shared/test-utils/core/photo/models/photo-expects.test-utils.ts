import { IPhoto, IPhotoStoredData } from "#photo-context";
import { SortDirection } from "#shared/models";

export interface IPhotoExpects {
  expectEqualPhotos(photo1: IPhoto, photo2: IPhoto): void;
  expectEqualPhotoArrays(photos1: IPhoto[], photos2: IPhoto[]): void;
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
  checkAssertions(): void;
}
