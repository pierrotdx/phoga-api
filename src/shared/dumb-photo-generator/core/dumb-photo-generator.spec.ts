import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import {
  ILoremIpsumGenerator,
  IUuidGenerator,
  LoremIpsumGenerator,
  UuidGenerator,
} from "@shared";

import { DumbPhotoGenerator } from "./dumb-photo-generator";
import { DumbPhotoGeneratorTestUtils } from "./dumb-photo-generator.test-utils";
import { IDumbPhotoGenerator, IDumbPhotoGeneratorOptions } from "./models";

describe("dumbPhotoGenerator", () => {
  let dumbPhotoGenerator: IDumbPhotoGenerator;
  let testUtils: DumbPhotoGeneratorTestUtils;
  let uuidGenerator: IUuidGenerator;
  let loremIpsumGenerator: ILoremIpsumGenerator;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(() => {
    uuidGenerator = new UuidGenerator();
    loremIpsumGenerator = new LoremIpsumGenerator();
    dumbPhotoGenerator = new DumbPhotoGenerator(
      uuidGenerator,
      loremIpsumGenerator,
    );
    testUtils = new DumbPhotoGeneratorTestUtils();
    assertionsCounter = new AssertionsCounter();
  });

  describe("generate", () => {
    const nbTests = 5;
    for (let index = 0; index < nbTests; index++) {
      it("should generate a valid photo", () => {
        const photo = dumbPhotoGenerator.generatePhoto();
        testUtils.expectAnInstanceOfPhoto(photo, assertionsCounter);
        assertionsCounter.checkAssertions();
      });
    }

    it.each`
      fieldPath                      | options
      ${["_id"]}                     | ${{ _id: "d90de24d-2c6b-4ce3-9733-7749d485ee87" }}
      ${["imageBuffer"]}             | ${{ imageBuffer: Buffer.from("a test of a different image buffer") }}
      ${["metadata", "location"]}    | ${{ location: "dumb location" }}
      ${["metadata", "date"]}        | ${{ date: new Date() }}
      ${["metadata", "titles"]}      | ${{ titles: ["dumb title1", "dumb title 2"] }}
      ${["metadata", "description"]} | ${{ description: "dumb description" }}
    `(
      "should generate a photo matching the input metadata.location",
      ({
        fieldPath,
        options,
      }: {
        fieldPath: string[];
        options: IDumbPhotoGeneratorOptions;
      }) => {
        const photo = dumbPhotoGenerator.generatePhoto(options);
        testUtils.expectAnInstanceOfPhoto(photo, assertionsCounter);
        testUtils.expectMatchingValues({
          fieldPath,
          photo,
          options,
          assertionsCounter,
        });
        assertionsCounter.checkAssertions();
      },
    );
  });

  describe("generatePhotos", () => {
    it.each`
      nbPhotos
      ${5}
    `(
      "should generate the required nb of photos ($nbPhotos)",
      ({ nbPhotos }: { nbPhotos: number }) => {
        const result = dumbPhotoGenerator.generatePhotos(nbPhotos);
        expect(result.length).toBe(nbPhotos);
        assertionsCounter.increase();
        result.forEach((r) => {
          testUtils.expectAnInstanceOfPhoto(r, assertionsCounter);
        });
        assertionsCounter.checkAssertions();
      },
    );
  });

  describe("generatePhotoFromAssets", () => {
    it.each`
      path
      ${"assets/test-img-1.jpg"}
      ${"assets/test-img-2.jpg"}
    `(
      "should generate a photo where the image buffer matches the image from path",
      async ({ path }: { path: string }) => {
        const result = await dumbPhotoGenerator.generatePhotoFromPath(path);
        testUtils.expectAnInstanceOfPhoto(result, assertionsCounter);
        await testUtils.expectPhotoBufferToMatchImageFromPath(
          result,
          path,
          assertionsCounter,
        );
        assertionsCounter.checkAssertions();
      },
    );
  });
});