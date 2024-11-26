import { readFile } from "fs/promises";

import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import { dumbPhotoGenerator } from "@dumb-photo-generator";
import { ImageEditor, ImageSize } from "@shared";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
} from "../../../adapters/secondary";
import { IPhoto, IRendering, SortDirection } from "../../../core";
import { SearchPhoto } from "./search-photo";
import { SearchPhotoTestUtils } from "./search-photo.test-utils";

describe(`${SearchPhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const imageEditor = new ImageEditor();
  const testUtils = new SearchPhotoTestUtils(
    photoMetadataDb,
    photoImageDb,
    imageEditor,
  );
  let assertionsCounter: IAssertionsCounter;
  let searchPhotos: SearchPhoto;

  const imagePaths = [
    "assets/test-img-1_536x354.jpg",
    "assets/test-img-2_536x354.jpg",
  ];

  beforeEach(async () => {
    const nbStorePhotos = 3;
    const storedPhotos = dumbPhotoGenerator.generatePhotos(nbStorePhotos);
    await testUtils.initStoredPhotos(storedPhotos);

    searchPhotos = new SearchPhoto(
      testUtils.photoMetadataDb,
      testUtils.photoImageDb,
      imageEditor,
    );

    assertionsCounter = new AssertionsCounter();
  });

  afterEach(async () => {
    await testUtils.clearStoredPhotos();
  });

  describe(`${SearchPhoto.prototype.execute.name}`, () => {
    it("should return the photos stored in database", async () => {
      const searchResult = await searchPhotos.execute();
      testUtils.expectSearchResultToMatchStoredPhotos(searchResult);
    });

    describe("+ options.rendering.date", () => {
      it.each`
        case            | rendering
        ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
        ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
      `(
        "should sort them by $case date when required",
        async ({ rendering }: { rendering: IRendering }) => {
          const searchResult = await searchPhotos.execute({ rendering });
          testUtils.expectSearchResultMatchingDateOrdering(
            searchResult,
            rendering.dateOrder,
            assertionsCounter,
          );
          assertionsCounter.checkAssertions();
        },
      );
    });

    describe("+ options.rendering.size", () => {
      it.each`
        rendering      | requiredSize
        ${{ size: 0 }} | ${0}
        ${{ size: 1 }} | ${1}
        ${{ size: 2 }} | ${2}
        ${{ size: 3 }} | ${3}
      `(
        "should return at most $requiredSize results when required",
        async ({ requiredSize, rendering }) => {
          const searchResult = await searchPhotos.execute({ rendering });
          testUtils.expectSearchResultMatchingSize(
            searchResult,
            requiredSize,
            assertionsCounter,
          );
          assertionsCounter.checkAssertions();
        },
      );
    });

    describe("+ options.rendering.from", () => {
      it.each`
        rendering      | docIndex
        ${{ from: 1 }} | ${0}
        ${{ from: 2 }} | ${1}
        ${{ from: 3 }} | ${2}
      `(
        "should return results starting from the $docIndex-th stored photo",
        async ({ rendering, docIndex }) => {
          const result = await searchPhotos.execute({ rendering });
          testUtils.expectSearchResultToStartFromRequiredIndex(
            result,
            docIndex,
          );
        },
      );
    });

    describe("+ options.excludeImages", () => {
      it.each`
        case                | excludeImages
        ${"without images"} | ${true}
        ${"with images"}    | ${false}
      `(
        "should return photos $case when excludeImages is `$excludeImages`",
        async ({ excludeImages }: { excludeImages: boolean }) => {
          const photos = await searchPhotos.execute({ excludeImages });
          testUtils.expectImagesToBeInSearchResultIfRequired(
            photos,
            excludeImages,
          );
        },
      );
    });

    describe("+ options.imageSize", () => {
      let images: Buffer[];
      let sizedPhotos: IPhoto[];

      beforeEach(async () => {
        await testUtils.clearStoredPhotos();
        images = await Promise.all(
          imagePaths.map(async (path) => await readFile(path)),
        );
        sizedPhotos = images.map((imageBuffer) =>
          dumbPhotoGenerator.generatePhoto({ imageBuffer }),
        );
        await testUtils.initStoredPhotos(sizedPhotos);
      });

      afterEach(async () => {
        const ids = sizedPhotos.map((p) => p._id);
        await testUtils.deletePhotosInDb(ids);
      });

      it.each`
        expectedSize
        ${{ width: 156, height: 984 }}
        ${{ width: 651, height: 545 }}
        ${{ width: 387, height: 159 }}
      `(
        "should return images with the expected size",
        async ({ expectedSize }: { expectedSize: ImageSize }) => {
          const photos = await searchPhotos.execute({
            imageSize: expectedSize,
          });
          await testUtils.expectPhotosImagesSize(
            photos,
            expectedSize,
            assertionsCounter,
          );
        },
      );
    });
  });
});
