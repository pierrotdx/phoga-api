import { IRendering, ISearchResult, SortDirection } from "#shared/models";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";
import { ITag, ITagDb, TagDbFake } from "#tag-context";
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
  IPhotoStoredData,
  IPhotoUseCaseTestUtils,
  ISearchPhotoParams,
  ISearchPhotoUseCase,
  Photo,
  fromPhotoStoredDataToPhotoData,
} from "../../../core/";
import { PhotoUseCaseTestUtils } from "../test-utils";
import { SearchPhotoUseCase } from "./search-photo";

describe(`${SearchPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;
  let tagDb: ITagDb;

  let testedUseCase: ISearchPhotoUseCase;

  let dbTestUtils: IPhotoDbTestUtils;
  let expectsTestUtils: IPhotoExpectsTestUtils;
  let useCaseTestUtils: IPhotoUseCaseTestUtils<ISearchResult<IPhoto>>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();
    tagDb = new TagDbFake();

    testedUseCase = new SearchPhotoUseCase(photoDataDb, photoImageDb);

    dbTestUtils = new PhotoDbTestUtils(photoDataDb, photoImageDb, tagDb);
    expectsTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
    useCaseTestUtils = new PhotoUseCaseTestUtils(
      testedUseCase,
      expectsTestUtils,
    );
  });

  describe(`${SearchPhotoUseCase.prototype.execute.name}`, () => {
    const nbStoredPhotos = 3;
    let storedPhotos: IPhoto[];
    const timeout = 10000;

    beforeEach(async () => {
      storedPhotos = await dumbPhotoGenerator.generatePhotos(nbStoredPhotos);
      await dbTestUtils.addPhotos(storedPhotos);
    }, timeout);

    afterEach(async () => {
      const storedPhotoIds = storedPhotos.map((p) => p._id);
      await dbTestUtils.deletePhotos(storedPhotoIds);
    });

    describe("when no filter is required", () => {
      let useCaseParams: ISearchPhotoParams;

      it("should return the photos stored in the database", async () => {
        const expectedSearchResult: ISearchResult<IPhoto> = {
          hits: storedPhotos,
          totalCount: storedPhotos.length,
        };

        const searchResult = await useCaseTestUtils.executeTestedUseCase();

        expectsTestUtils.expectEqualSearchResults(
          searchResult,
          expectedSearchResult,
        );
        expectsTestUtils.checkAssertions();
      });

      describe("when using the `tagId` filter", () => {
        const tag: ITag = { _id: "tag-id", name: "tag name" };
        let storedPhotosWithTag: IPhotoStoredData[];

        beforeEach(async () => {
          storedPhotosWithTag = dumbPhotoGenerator.generatePhotosStoredData(3, {
            tags: [tag],
          });
          await dbTestUtils.addStoredPhotosData(storedPhotosWithTag);

          useCaseParams = { filter: { tagId: tag._id } };
        });

        afterEach(async () => {
          const ids = storedPhotosWithTag.map((p) => p._id);
          await dbTestUtils.deletePhotos(ids);
        });

        it("should return the photos whose tags include the required tag", async () => {
          const expectedPhotos: IPhoto[] = storedPhotosWithTag.map(
            (p) =>
              new Photo(p._id, {
                photoData: fromPhotoStoredDataToPhotoData(p),
              }),
          );
          const expectedSearchResult: ISearchResult<IPhoto> = {
            hits: expectedPhotos,
            totalCount: storedPhotos.length,
          };

          const searchResult =
            await useCaseTestUtils.executeTestedUseCase(useCaseParams);

          expectsTestUtils.expectEqualSearchResults(
            searchResult,
            expectedSearchResult,
          );
          expectsTestUtils.checkAssertions();
        });
      });

      describe("when using the `rendering.date` option", () => {
        it.each`
          case            | rendering
          ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
          ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
        `(
          "should sort them by $case date when required",
          async ({ rendering }: { rendering: IRendering }) => {
            useCaseParams = { options: { rendering } };
            const expectedOrder = rendering.dateOrder;

            const result =
              await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            expectsTestUtils.expectPhotosOrderToBe(result.hits, expectedOrder);
            expectsTestUtils.checkAssertions();
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
            useCaseParams = { options: { rendering } };

            const result =
              await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            expectsTestUtils.expectArraySizeToBeAtMost(
              result.hits,
              expectedSize,
            );
            expectsTestUtils.checkAssertions();
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
            useCaseParams = { options: { rendering } };

            const result =
              await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            expectsTestUtils.expectSubArrayToStartFromIndex(
              storedPhotos,
              result.hits,
              expectedStartIndex,
            );
            expectsTestUtils.checkAssertions();
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
            useCaseParams = { options: { excludeImages } };
            const expectedPhotos = clone(storedPhotos).map((p) =>
              excludeImages ? getPhotoWithoutImage(p) : p,
            );
            const expectedSearchResult: ISearchResult<IPhoto> = {
              hits: expectedPhotos,
              totalCount: storedPhotos.length,
            };

            const result =
              await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            expectsTestUtils.expectEqualSearchResults(
              result,
              expectedSearchResult,
            );
            expectsTestUtils.checkAssertions();
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
