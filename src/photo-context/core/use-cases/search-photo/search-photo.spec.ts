import { IRendering, SortDirection } from "#shared/models";

import {
  FakePhotoBaseDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import {
  IPhoto,
  IPhotoBaseDb,
  IPhotoImageDb,
  ISearchPhotoUseCase,
  PhotoTestUtils,
} from "../../../core/";
import { SearchPhotoUseCase } from "./search-photo";

describe(`${SearchPhotoUseCase.name}`, () => {
  let photoBaseDb: IPhotoBaseDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: ISearchPhotoUseCase;

  let testUtils: PhotoTestUtils<IPhoto[]>;

  beforeEach(async () => {
    photoBaseDb = new FakePhotoBaseDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new SearchPhotoUseCase(photoBaseDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoBaseDb, photoImageDb, testedUseCase);
  });

  describe(`${SearchPhotoUseCase.prototype.execute.name}`, () => {
    const nbStoredPhotos = 3;
    let storedPhotos: IPhoto[];

    beforeEach(async () => {
      storedPhotos = await dumbPhotoGenerator.generatePhotos(nbStoredPhotos);
      await testUtils.insertPhotosInDb(storedPhotos);
    });

    afterEach(async () => {
      const storedPhotoIds = storedPhotos.map((p) => p._id);
      await testUtils.deletePhotosFromDb(storedPhotoIds);
    });

    it("should return the photos stored in database", async () => {
      const searchResult = await testUtils.executeTestedUseCase();

      testUtils.expectMatchingPhotoArrays(searchResult, storedPhotos);
      testUtils.checkAssertions();
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

          testUtils.expectPhotosOrderToBe(searchResult, rendering.dateOrder);

          testUtils.checkAssertions();
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

          testUtils.expectPhotosArraySizeToBe(searchResult, requiredSize);
          testUtils.checkAssertions();
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

          testUtils.expectSubArrayToStartFromIndex(
            storedPhotos,
            result,
            docIndex,
          );
          testUtils.checkAssertions();
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

          testUtils.expectImagesToBeInPhotosIfRequired(photos, excludeImages);
          testUtils.checkAssertions();
        },
      );
    });
  });
});
