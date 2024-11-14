import {
  AssertionsCounter,
  IAssertionsCounter,
  dumbPhotoGenerator,
} from "@shared";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
} from "../../../adapters/secondary";
import { IRendering, SortDirection } from "../../../core";
import { SearchPhoto } from "./search-photo";
import { SearchPhotoTestUtils } from "./search-photo.test-utils";

describe(`${SearchPhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const testUtils = new SearchPhotoTestUtils(photoMetadataDb, photoImageDb);
  let assertionsCounter: IAssertionsCounter;
  let searchPhotos: SearchPhoto;

  beforeEach(async () => {
    const nbStorePhotos = 3;
    const storedPhotos = dumbPhotoGenerator.generatePhotos(nbStorePhotos);
    await testUtils.initStoredPhotos(storedPhotos);

    searchPhotos = new SearchPhoto(
      testUtils.photoMetadataDb,
      testUtils.photoImageDb,
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
  });
});
