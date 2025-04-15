import { IRendering, SortDirection } from "#shared/models";
import { clone } from "ramda";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import {
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
  ISearchPhotoParams,
  ISearchPhotoUseCase,
  PhotoTestUtils,
} from "../../../core/";
import { SearchPhotoUseCase } from "./search-photo";

describe(`${SearchPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: ISearchPhotoUseCase;

  let testUtils: PhotoTestUtils<IPhoto[]>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new SearchPhotoUseCase(photoDataDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoDataDb, photoImageDb, testedUseCase);
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

    describe("when no filter is required", () => {
      let useCaseOptions: ISearchPhotoParams;

      it("should return the photos stored in the database", async () => {
        const searchResult = await testUtils.executeTestedUseCase();

        testUtils.expectEqualPhotoArrays(searchResult, storedPhotos);
        testUtils.checkAssertions();
      });

      describe("when using the `rendering.date` option", () => {
        it.each`
          case            | rendering
          ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
          ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
        `(
          "should sort them by $case date when required",
          async ({ rendering }: { rendering: IRendering }) => {
            useCaseOptions = { rendering };
            const expectedOrder = rendering.dateOrder;

            const result = await testUtils.executeTestedUseCase(useCaseOptions);

            testUtils.expectPhotosOrderToBe(result, expectedOrder);
            testUtils.checkAssertions();
          },
        );
      });

      describe("when using the `rendering.size` options", () => {
        it.each`
          rendering      | expectedSize
          ${{ size: 0 }} | ${0}
          ${{ size: 1 }} | ${1}
          ${{ size: 2 }} | ${2}
          ${{ size: 3 }} | ${3}
        `(
          "should return at most $expectedSize results when required",
          async ({ rendering, expectedSize }) => {
            useCaseOptions = { rendering };

            const result = await testUtils.executeTestedUseCase(useCaseOptions);

            testUtils.expectArraySizeToBeAtMost(result, expectedSize);
            testUtils.checkAssertions();
          },
        );
      });

      describe("when using the `rendering.from` option", () => {
        it.each`
          rendering      | expectedStartIndex
          ${{ from: 1 }} | ${0}
          ${{ from: 2 }} | ${1}
          ${{ from: 3 }} | ${2}
        `(
          "should return results starting from the $expectedStartIndex-th stored photo",
          async ({ rendering, expectedStartIndex }) => {
            useCaseOptions = { rendering };

            const result = await testUtils.executeTestedUseCase(useCaseOptions);

            testUtils.expectSubArrayToStartFromIndex(
              storedPhotos,
              result,
              expectedStartIndex,
            );
            testUtils.checkAssertions();
          },
        );
      });

      describe("when using the `excludeImages` option", () => {
        it.each`
          case                | excludeImages
          ${"without images"} | ${true}
          ${"with images"}    | ${false}
        `(
          "should return photos $case when excludeImages is `$excludeImages`",
          async ({ excludeImages }: { excludeImages: boolean }) => {
            useCaseOptions = { excludeImages };
            const expectedPhotos = clone(storedPhotos).map((p) =>
              excludeImages ? getPhotoWithoutImage(p) : p,
            );

            const result = await testUtils.executeTestedUseCase(useCaseOptions);

            testUtils.expectEqualPhotoArrays(result, expectedPhotos);
            testUtils.checkAssertions();
          },
        );
      });
    });
  });
});

function getPhotoWithoutImage(photo: IPhoto): IPhoto {
  delete photo.imageBuffer;
  return photo;
}
