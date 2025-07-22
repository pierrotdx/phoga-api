import { IAssertionsCounter } from "#shared/assertions-counter";
import { Buffer } from "buffer";
import { readFile } from "fs/promises";
import { path } from "ramda";

import { IGeneratePhotoOptions, IPhoto } from "../models";

export class DumbPhotoGeneratorTestUtils {
  expectAnInstanceOfPhoto(
    candidate: any,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(candidate._id).toBeDefined();
    assertionsCounter.increase();
    const date = candidate.metadata?.date;
    if (date) {
      expect(date).toBeInstanceOf(Date);
      assertionsCounter.increase();
    }
    const description = candidate.metadata?.description;
    if (description) {
      expect(typeof description).toBe("string");
      assertionsCounter.increase();
    }
    const titles = candidate.metadata?.tiltes;
    if (titles) {
      expect(Array.isArray(titles)).toBeTruthy();
      assertionsCounter.increase();

      titles.forEach((t) => {
        expect(typeof t).toBe("string");
        assertionsCounter.increase();
      });
    }
    const tags = candidate.tags;
    if (tags) {
      expect(Array.isArray(tags)).toBeTruthy();
      assertionsCounter.increase();

      tags.forEach((t) => {
        expect(typeof t).toBe("string");
        assertionsCounter.increase();
      });
    }
    const imageBuffer = candidate.imageBuffer;
    if (imageBuffer) {
      expect(imageBuffer).toBeInstanceOf(Buffer);
      assertionsCounter.increase();
    }
    if (candidate.imageUrl) {
      expect(typeof candidate.imageUrl).toBeInstanceOf("string");
      assertionsCounter.increase();
    }
  }

  expectMatchingValues({
    fieldPath,
    photo,
    options,
    assertionsCounter,
  }: {
    fieldPath: string[];
    photo: IPhoto;
    options: IGeneratePhotoOptions;
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
