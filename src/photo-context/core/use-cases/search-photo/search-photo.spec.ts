import { IRendering, SortDirection } from "#shared/models";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters/";
import { SearchPhotoUseCase } from "./search-photo";
import { SearchPhotoTestUtils } from "./search-photo.test-utils";

describe(`${SearchPhotoUseCase.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  let testUtils: SearchPhotoTestUtils;

  beforeEach(async () => {
    testUtils = new SearchPhotoTestUtils(photoMetadataDb, photoImageDb);
  });

  describe(`${SearchPhotoUseCase.prototype.execute.name}`, () => {
    const nbStoredPhotos = 3;

    beforeEach(async () => {
      await testUtils.initStoredPhotos(nbStoredPhotos);
    });

    afterEach(async () => {
      await testUtils.clearStoredPhotos();
    });

    it("should return the photos stored in database", async () => {
      const searchResult = await testUtils.executeTestedUseCase();

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
          const searchResult = await testUtils.executeTestedUseCase({
            rendering,
          });

          testUtils.expectSearchResultMatchingDateOrdering(
            searchResult,
            rendering.dateOrder,
          );
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
          const searchResult = await testUtils.executeTestedUseCase({
            rendering,
          });

          testUtils.expectSearchResultMatchingSize(searchResult, requiredSize);
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
          const result = await testUtils.executeTestedUseCase({ rendering });

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
          const photos = await testUtils.executeTestedUseCase({
            excludeImages,
          });

          testUtils.expectImagesToBeInSearchResultIfRequired(
            photos,
            excludeImages,
          );
        },
      );
    });
  });
});
