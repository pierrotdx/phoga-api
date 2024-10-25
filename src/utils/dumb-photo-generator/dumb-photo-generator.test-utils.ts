import { readFile } from "fs/promises";
import { path } from "ramda";

import { IPhoto } from "@business-logic";

import { isPhoto } from "../assertions";
import { IAssertionsCounter, IDumbPhotoGeneratorOptions } from "../models";

export class DumbPhotoGeneratorTestUtils {
  expectAnInstanceOfPhoto(
    candidate: unknown,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(isPhoto(candidate)).toBe(true);
    assertionsCounter.increase();
  }

  expectMatchingValues({
    fieldPath,
    photo,
    options,
    assertionsCounter,
  }: {
    fieldPath: string[];
    photo: IPhoto;
    options: IDumbPhotoGeneratorOptions;
    assertionsCounter: IAssertionsCounter;
  }): void {
    const field = path(fieldPath, photo);
    if (!field) {
      throw new Error("invalid field value");
    }
    const option = Object.values(options)[0];
    expect(field).toEqual(option);
    assertionsCounter.increase();
  }

  async expectPhotoBufferToMatchImageFromPath(
    photo: IPhoto,
    path: string,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const expectedImageBuffer = await readFile(path);
    const isSameBuffer = expectedImageBuffer.compare(photo.imageBuffer) === 0;
    expect(isSameBuffer).toBe(true);
    assertionsCounter.increase();
  }
}
