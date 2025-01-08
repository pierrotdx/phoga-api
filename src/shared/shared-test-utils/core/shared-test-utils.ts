import { buffer } from "node:stream/consumers";
import { omit } from "ramda";

import { IAssertionsCounter } from "@assertions-counter";
import { IPhoto } from "@domain";

import { ISharedTestUtils } from "../core";

export class SharedTestUtils implements ISharedTestUtils {
  async expectRejection({
    fnExpectedToReject,
    fnParams,
    assertionsCounter,
  }: {
    fnExpectedToReject: Function;
    fnParams: unknown[];
    assertionsCounter: IAssertionsCounter;
  }): Promise<void> {
    try {
      await fnExpectedToReject(...fnParams);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      assertionsCounter.increase();
    }
  }

  expectFunctionToBeCalledWith(
    assertionsCounter: IAssertionsCounter,
    spy: jest.SpyInstance,
    ...params: unknown[]
  ): void {
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(...params);
    assertionsCounter.increase(2);
  }

  expectMatchingBuffers(
    bufferA: Buffer,
    bufferB: Buffer,
    assertionsCounter: IAssertionsCounter,
  ) {
    const areEqualBuffers = bufferA.equals(bufferB);
    expect(areEqualBuffers).toBe(true);
    assertionsCounter.increase();
  }

  expectMatchingPhotos(
    photo1: IPhoto,
    photo2: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(photo1._id).toEqual(photo2._id);
    assertionsCounter.increase();
    this.expectMatchingPhotosMetadata(
      photo1.metadata,
      photo2.metadata,
      assertionsCounter,
    );
    this.expectMatchingBuffers(
      photo1.imageBuffer,
      photo2.imageBuffer,
      assertionsCounter,
    );
  }

  expectMatchingPhotosMetadata(
    photoMetadata1: IPhoto["metadata"],
    photoMetadata2: IPhoto["metadata"],
    assertionsCounter: IAssertionsCounter,
  ): void {
    const metadata1WithoutThumbnail = omit(["thumbnail"], photoMetadata1);
    const metadata2WithoutThumbnail = omit(["thumbnail"], photoMetadata2);
    expect(metadata1WithoutThumbnail).toEqual(metadata2WithoutThumbnail);
    assertionsCounter.increase(1);
    this.expectMatchingBuffers(
      photoMetadata1.thumbnail,
      photoMetadata2.thumbnail,
      assertionsCounter,
    );
  }
}
