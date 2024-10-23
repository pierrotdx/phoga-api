import { FakePhotoImageDb, FakePhotoMetadataDb } from "@adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "@business-logic/gateways";
import { IRendering, SortDirection } from "@business-logic/models";

import { SearchPhoto } from "./search-photo";
import { SearchPhotoTestUtils } from "./search-photo.test-utils";

describe("SearchPhoto", () => {
  let searchPhotoTestUtils: SearchPhotoTestUtils;
  let searchPhotos: SearchPhoto;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    searchPhotoTestUtils = new SearchPhotoTestUtils(metadataDb, imageDb);
    await searchPhotoTestUtils.init();
    searchPhotos = new SearchPhoto(metadataDb, imageDb);
  });

  describe("execute", () => {
    it("should return the photos stored in database", async () => {
      const searchResult = await searchPhotos.execute();
      searchPhotoTestUtils.expectSearchResultToMatchStoredPhotos(searchResult);
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
          searchPhotoTestUtils.expectSearchResultToBeSortedAsRequired(
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
          const searchResult = await searchPhotos.execute({ rendering });
          searchPhotoTestUtils.expectSearchResultSizeToMatchRequiredSize(
            searchResult,
            requiredSize,
          );
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
          searchPhotoTestUtils.expectSearchResultToStartFromRequiredIndex(
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
          searchPhotoTestUtils.expectImagesToBeInSearchResultIfRequired(
            photos,
            excludeImages,
          );
        },
      );
    });
  });
});
