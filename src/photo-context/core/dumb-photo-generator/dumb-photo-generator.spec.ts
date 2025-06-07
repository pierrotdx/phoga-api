import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { ILoremIpsumGenerator, LoremIpsumGenerator } from "#shared/lorem-ipsum";
import { IUuidGenerator, UuidGenerator } from "#shared/uuid";

import { IDumbPhotoGenerator, IGeneratePhotoOptions } from "../models";
import { DumbPhotoGenerator } from "./dumb-photo-generator";
import { DumbPhotoGeneratorTestUtils } from "./dumb-photo-generator.test-utils";

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
      it("should generate a valid photo", async () => {
        const photo = await dumbPhotoGenerator.generatePhoto();
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
      async ({
        fieldPath,
        options,
      }: {
        fieldPath: string[];
        options: IGeneratePhotoOptions;
      }) => {
        const photo = await dumbPhotoGenerator.generatePhoto(options);
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
      async ({ nbPhotos }: { nbPhotos: number }) => {
        const result = await dumbPhotoGenerator.generatePhotos(nbPhotos);
        expect(result.length).toBe(nbPhotos);
        assertionsCounter.increase();
        result.forEach((r) => {
          testUtils.expectAnInstanceOfPhoto(r, assertionsCounter);
        });
        assertionsCounter.checkAssertions();
      },
      5000,
    );
  });
});
