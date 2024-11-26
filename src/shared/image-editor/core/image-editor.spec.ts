import { read } from "fs";
import { readFile } from "fs/promises";

import { ImageSize } from "@shared/models";

import { ImageEditor } from "./image-editor";
import { IImageEditor } from "./models";

describe(`${ImageEditor.name}`, () => {
  const imagePaths = [
    "assets/test-img-1_536x354.jpg",
    "assets/test-img-2_536x354.jpg",
  ];
  let imageEditor: IImageEditor;

  beforeEach(async () => {
    imageEditor = new ImageEditor();
  });

  describe(`${ImageEditor.prototype.getSize.name}`, () => {
    it.each`
      path
      ${imagePaths[0]}
      ${imagePaths[1]}
    `(
      "should return the correct size of image located at `$path`",
      async ({ path }: { path: string }) => {
        const image = await readFile(path);
        const expectedSize: ImageSize = { width: 536, height: 354 };
        const size = imageEditor.getSize(image);
        expect(size).toEqual(expectedSize);
        expect.assertions(1);
      },
    );
  });

  describe(`${ImageEditor.prototype.resize.name}`, () => {
    it.each`
      path             | expectedSize
      ${imagePaths[0]} | ${{ width: 20, height: 40 }}
      ${imagePaths[1]} | ${{ width: 459, height: 287 }}
    `(
      "should resize the image located at `$path` to $expectedSize",
      async ({
        path,
        expectedSize,
      }: {
        path: string;
        expectedSize: ImageSize;
      }) => {
        const image = await readFile(path);
        const newImage = await imageEditor.resize(image, expectedSize);
        const newImageSize = imageEditor.getSize(newImage);
        expect(newImageSize).toEqual(expectedSize);
        expect.assertions(1);
      },
    );
  });
});
