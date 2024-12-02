import { IAssertionsCounter } from "@assertions-counter";
import { IPhoto } from "@domain";

export interface ISharedTestUtils {
  expectRejection({
    fnExpectedToReject,
    fnParams,
    assertionsCounter,
  }: {
    fnExpectedToReject: Function;
    fnParams: unknown[];
    assertionsCounter: IAssertionsCounter;
  }): Promise<void>;
  expectFunctionToBeCalledWith(
    assertionsCounter: IAssertionsCounter,
    spy: jest.SpyInstance,
    ...params: unknown[]
  ): void;
  expectMatchingPhotos(
    photo1: IPhoto,
    photo2: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void;
  expectMatchingPhotosMetadata(
    photoMetadata1: IPhoto["metadata"],
    photoMetadata2: IPhoto["metadata"],
    assertionsCounter: IAssertionsCounter,
  ): void;
}
