import { ISearchResult, SortDirection } from "#shared/models";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";
import { ITag, ITagDb, TagDbFake } from "#tag-context";
import { clone } from "ramda";

import { FakePhotoDataDb, FakePhotoImageDb } from "../../../adapters/";
import {
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
  IPhotoStoredData,
  ISearchPhotoOptions,
  ISearchPhotoParams,
  ISearchPhotoUseCase,
  Photo,
  comparePhotoDates,
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
  let useCaseTestUtils: PhotoUseCaseTestUtils<ISearchResult<IPhoto>>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();
    tagDb = new TagDbFake();

    testedUseCase = new SearchPhotoUseCase(photoDataDb);

    dbTestUtils = new PhotoDbTestUtils(photoDataDb, photoImageDb, tagDb);
    expectsTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
    useCaseTestUtils = new PhotoUseCaseTestUtils(
      testedUseCase,
      expectsTestUtils,
      undefined,
      photoImageDb,
    );
  });

  describe(`${SearchPhotoUseCase.prototype.execute.name}`, () => {
    let storedPhotos: IPhoto[];
    const timeout = 10000;

    beforeEach(async () => {
      storedPhotos = [
        new Photo("stored photo 1", {
          photoData: {
            metadata: {
              description: "stored photo 1",
              date: new Date("2004-04-04"),
            },
          },
        }),
        new Photo("stored photo 2", {
          photoData: {
            metadata: {
              description: "stored photo 2",
              date: new Date("2023-08-31"),
            },
          },
        }),
        new Photo("stored photo 3", {
          photoData: {
            metadata: {
              description: "stored photo 3",
              date: new Date("2012-06-08"),
            },
          },
        }),
      ];
      await dbTestUtils.addPhotos(storedPhotos);
      await useCaseTestUtils.addImageUrls(storedPhotos);
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
          expectedSearchResult,
          searchResult,
        );
        expectsTestUtils.checkAssertions();
      });

      describe("when using the `tagId` filter", () => {
        const tag: ITag = { _id: "tag-id", name: "tag name" };
        let storedPhotosWithTag: IPhotoStoredData[];

        beforeEach(async () => {
          storedPhotosWithTag = [
            new Photo("stored photo with tag 1", {
              photoData: { tags: [tag] },
            }),
            new Photo("stored photo with tag 2", {
              photoData: { tags: [tag] },
            }),
            new Photo("stored photo with tag 3", {
              photoData: { tags: [tag] },
            }),
          ];
          await dbTestUtils.addStoredPhotosData(storedPhotosWithTag);

          useCaseParams = { filter: { tagId: tag._id } };
        });

        afterEach(async () => {
          const ids = storedPhotosWithTag.map((p) => p._id);
          await dbTestUtils.deletePhotos(ids);
        });

        it("should return the photos whose tags include the required tag", async () => {
          const expectedPhotos: IPhoto[] = storedPhotosWithTag.map(
            (photoData) => new Photo(photoData._id, { photoData }),
          );
          const expectedSearchResult: ISearchResult<IPhoto> = {
            hits: expectedPhotos,
            totalCount: storedPhotos.length,
          };

          const searchResult =
            await useCaseTestUtils.executeTestedUseCase(useCaseParams);

          expectsTestUtils.expectEqualSearchResults(
            expectedSearchResult,
            searchResult,
          );
          expectsTestUtils.checkAssertions();
        });
      });

      describe("when using the `date` option", () => {
        it.each`
          case            | options
          ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
          ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
        `(
          "should sort them by $case date when required",
          async ({ options }: { options: ISearchPhotoOptions }) => {
            useCaseParams = { options };
            const expectedOrder = options.dateOrder;

            const result =
              await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            expectsTestUtils.expectPhotosOrderToBe(result.hits, expectedOrder);
            expectsTestUtils.checkAssertions();
          },
        );
      });

      describe("when using the `size` options", () => {
        it.each`
          options        | expectedSize
          ${{ size: 0 }} | ${0}
          ${{ size: 1 }} | ${1}
          ${{ size: 2 }} | ${2}
          ${{ size: 3 }} | ${3}
        `(
          "should return at most $expectedSize results when required",
          async ({ options, expectedSize }) => {
            useCaseParams = { options };

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

      describe("when using the `from` option", () => {
        let orderedStoredPhotos: IPhotoStoredData[];
        const sortDirection = SortDirection.Ascending;

        beforeEach(() => {
          orderedStoredPhotos = clone(storedPhotos);
          orderedStoredPhotos.sort(comparePhotoDates);
        });

        it.each`
          options                                  | expectedStartIndex
          ${{ from: 1, dateOrder: sortDirection }} | ${0}
          ${{ from: 2, dateOrder: sortDirection }} | ${1}
          ${{ from: 3, dateOrder: sortDirection }} | ${2}
        `(
          "should return results starting from the $expectedStartIndex-th stored photo",
          async ({ options, expectedStartIndex }) => {
            useCaseParams = { options };

            const result =
              await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            expectsTestUtils.expectSubArrayToStartFromIndex(
              orderedStoredPhotos,
              result.hits,
              expectedStartIndex,
            );
            expectsTestUtils.checkAssertions();
          },
        );
      });
    });
  });
});
