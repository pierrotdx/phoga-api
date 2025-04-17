import { IPhoto, IPhotoStoredData } from "#photo-context";
import { SortDirection } from "#shared/models";

export interface IPhotoExpects {
  expectMatchingPhotos(photo1: IPhoto, photo2: IPhoto): void;
  expectPhotoStoredDataToBe(
    id: IPhoto["_id"],
    expectedValue: IPhotoStoredData,
  ): Promise<void>;
  expectPhotoStoredImageToBe(
    id: IPhoto["_id"],
    expectedImageBuffer: IPhoto["imageBuffer"],
  ): Promise<void>;
  expectEqualPhotoArrays(photos1: IPhoto[], photos2: IPhoto[]): void;
  expectSubArrayToStartFromIndex(
    baseArray: IPhoto[],
    subArray: IPhoto[],
    requiredIndex: number,
  ): void;
  expectPhotosOrderToBe(photos: IPhoto[], dateOrdering: SortDirection): void;
  expectArraySizeToBeAtMost(photos: IPhoto[], size: number): void;
  checkAssertions(): void;
}
