import { clone } from "ramda";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "@adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "@business-logic/gateways";
import { SortDirection } from "@business-logic/models";
import { comparePhotoDates, insertPhotosInDbs } from "@utils";

import { SearchPhoto } from "./search-photo";
import { SearchPhotoTestUtils } from "./search-photo.test-utils";

describe("SearchPhoto", () => {
  const searchPhotoTestUtils = new SearchPhotoTestUtils();
  let searchPhotos: SearchPhoto;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    searchPhotos = new SearchPhoto(metadataDb, imageDb);
    await insertPhotosInDbs(searchPhotoTestUtils.storedPhotos, {
      metadataDb,
      imageDb,
    });
  });

  describe("execute", () => {
    it("should return the photos stored in database", async () => {
      const result = await searchPhotos.execute();
      searchPhotoTestUtils.resultShouldMatchStoredPhotos(result);
    });

    describe("+ options.rendering.date", () => {
      const ascendingPhotos = clone(searchPhotoTestUtils.storedPhotos).sort(
        comparePhotoDates,
      );
      const descendingPhotos = clone(ascendingPhotos).reverse();

      it.each`
        case            | rendering                             | expectedSortedList
        ${"ascending"}  | ${{ date: SortDirection.Ascending }}  | ${ascendingPhotos}
        ${"descending"} | ${{ date: SortDirection.Descending }} | ${descendingPhotos}
      `(
        "should sort them by $case date when required",
        async ({ expectedSortedList, rendering }) => {
          const result = await searchPhotos.execute({ rendering });
          searchPhotoTestUtils.resultShouldBeSortedAsRequired(
            result,
            expectedSortedList,
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
          const result = await searchPhotos.execute({ rendering });
          searchPhotoTestUtils.resultSizeShouldMatchRequiredSize(
            result,
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
          searchPhotoTestUtils.resultShouldStartFromNthMatchingDocument(
            result,
            searchPhotoTestUtils.storedPhotos,
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
        "should return photos $case when excludeImages=$excludeImages",
        async ({ excludeImages }: { excludeImages: boolean }) => {
          const photos = await searchPhotos.execute({ excludeImages });
          searchPhotoTestUtils.imagesPresenceShouldFollowRequirement(
            photos,
            excludeImages,
          );
        },
      );
    });
  });
});
