import { IRendering, SortDirection } from "#shared/models";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";
import { ITag } from "#tag-context";

import { IPhotoStoredData, ISearchPhotoFilter } from "../../../../core";
import { dumbPhotoGenerator } from "../../../primary";
import { PhotoDataDbMongo } from "./photo-data-db.mongo";
import { PhotoDataDbMongoTestUtils } from "./photo-data-db.mongo.test-utils";

describe("PhotoDataDbMongo", () => {
  const setupTestUtils = new PhotoDataDbMongoTestUtils(
    global.__MONGO_URL__,
    global.__MONGO_DB_NAME__,
    { PhotoData: global.__MONGO_PHOTO_BASE_COLLECTION__ },
  );

  let dbTestUtils: IPhotoDbTestUtils;
  let expectsTestUtils: IPhotoExpectsTestUtils;

  let photoDataDbMongo: PhotoDataDbMongo;

  const timeout = 10000;

  beforeEach(async () => {
    await setupTestUtils.globalSetup();

    photoDataDbMongo = setupTestUtils.getPhotoDataDb();

    dbTestUtils = new PhotoDbTestUtils(photoDataDbMongo);
    expectsTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
  }, timeout);

  afterEach(async () => {
    await setupTestUtils.globalTeardown();
  });

  describe(`${PhotoDataDbMongo.prototype.insert.name}`, () => {
    let dataToInsert: IPhotoStoredData;

    beforeEach(() => {
      dataToInsert = dumbPhotoGenerator.generatePhotoStoredData();
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(dataToInsert._id);
    });

    it("should insert a document with the photo-store data", async () => {
      const expectedStoredData = dataToInsert;

      await photoDataDbMongo.insert(dataToInsert);
      const storedData = await dbTestUtils.getPhotoStoredData(dataToInsert._id);

      expectsTestUtils.expectEqualPhotos(storedData, expectedStoredData);
      expectsTestUtils.checkAssertions();
    });
  });

  describe(`${PhotoDataDbMongo.prototype.getById.name}`, () => {
    let dataToGet: IPhotoStoredData;

    beforeEach(async () => {
      dataToGet = dumbPhotoGenerator.generatePhotoStoredData();
      await dbTestUtils.addStoredPhotosData([dataToGet]);
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(dataToGet._id);
    });

    it("should return the photo data of the document matching the input id", async () => {
      const expectedData = dataToGet;

      const result = await photoDataDbMongo.getById(expectedData._id);

      expect(result).toEqual(expectedData);
      expect.assertions(1);
    });

    it("should return `undefined` if no matching document is found", async () => {
      const result = await photoDataDbMongo.getById("non-existent id");

      expect(result).toBeUndefined();
      expect.assertions(1);
    });
  });

  describe(`${PhotoDataDbMongo.prototype.replace.name}`, () => {
    let dataToReplace: IPhotoStoredData;

    beforeEach(async () => {
      dataToReplace = dumbPhotoGenerator.generatePhotoStoredData();
      await dbTestUtils.addPhoto(dataToReplace);
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(dataToReplace._id);
    });

    it("should replace the required document with the input photo base data", async () => {
      const expectedData = dumbPhotoGenerator.generatePhotoStoredData({
        _id: dataToReplace._id,
      });

      await photoDataDbMongo.replace(expectedData);
      const storedDataAfterReplace = await dbTestUtils.getPhotoStoredData(
        dataToReplace._id,
      );

      expect(storedDataAfterReplace).toEqual(expectedData);
      expect.assertions(1);
    });
  });

  describe(`${PhotoDataDbMongo.prototype.delete.name}`, () => {
    let dataToDelete: IPhotoStoredData;

    beforeEach(async () => {
      dataToDelete = dumbPhotoGenerator.generatePhotoStoredData();
      await dbTestUtils.addPhoto(dataToDelete);
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(dataToDelete._id);
    });

    it("should delete the required document", async () => {
      await photoDataDbMongo.delete(dataToDelete._id);
      const storedDataAfterDelete = await dbTestUtils.getPhotoStoredData(
        dataToDelete._id,
      );

      expect(storedDataAfterDelete).toBeUndefined();
      expect.assertions(1);
    });
  });

  describe(`${PhotoDataDbMongo.prototype.find.name}`, () => {
    let storedPhotos: IPhotoStoredData[];

    beforeEach(async () => {
      storedPhotos = dumbPhotoGenerator.generatePhotosStoredData(3);
      await dbTestUtils.addStoredPhotosData(storedPhotos);
    });

    afterEach(async () => {
      const storedPhotosIds = storedPhotos.map((p) => p._id);
      await dbTestUtils.deletePhotos(storedPhotosIds);
    });

    describe("when no filter is required", () => {
      it("should return all the documents", async () => {
        const expectedResult = storedPhotos;

        const result = await photoDataDbMongo.find();

        expectsTestUtils.expectEqualPhotoArrays(result, expectedResult);
        expectsTestUtils.checkAssertions();
      });

      describe("- rendering.date", () => {
        it.each`
          case            | rendering
          ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
          ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
        `(
          "should sort the returned documents by date in $case order when required",
          async ({ rendering }: { rendering: IRendering }) => {
            const expectedResult = setupTestUtils.getPhotosSortedByDate(
              storedPhotos,
              rendering.dateOrder,
            );

            const result = await photoDataDbMongo.find({ rendering });

            expectsTestUtils.expectEqualPhotoArrays(expectedResult, result);
            expectsTestUtils.checkAssertions();
          },
        );
      });

      describe("- rendering.size", () => {
        it.each`
          rendering
          ${{ size: 1 }}
          ${{ size: 2 }}
          ${{ size: 3 }}
        `(
          "should return at most $rendering.size results when required",
          async ({ rendering }: { rendering: IRendering }) => {
            const result = await photoDataDbMongo.find({ rendering });

            expectsTestUtils.expectArraySizeToBeAtMost(result, rendering.size);
            expectsTestUtils.checkAssertions();
          },
        );
      });

      describe("- rendering.from", () => {
        // use `rendering.date` to make we are testing `rendering.from` on the same ordered list
        it.each`
          rendering                                          | docIndex
          ${{ from: 1, dateOrder: SortDirection.Ascending }} | ${0}
          ${{ from: 2, dateOrder: SortDirection.Ascending }} | ${1}
          ${{ from: 3, dateOrder: SortDirection.Ascending }} | ${2}
        `(
          "should return results starting from the $docIndex-th stored photo",
          async ({
            rendering,
            docIndex,
          }: {
            rendering: IRendering;
            docIndex: number;
          }) => {
            const ascendingPhotos = setupTestUtils.getPhotosSortedByDate(
              storedPhotos,
              SortDirection.Ascending,
            );
            const expectedResult = ascendingPhotos[docIndex];

            const result = await photoDataDbMongo.find({ rendering });
            const firstResultItem = result[0];

            expect(firstResultItem).toEqual(expectedResult);
            expect.assertions(1);
          },
        );
      });
    });

    describe("when using the `tagId` filter", () => {
      const tag: ITag = { _id: "tag-id", name: "tag name" };
      let storedPhotosWithTag: IPhotoStoredData[];
      let filter: ISearchPhotoFilter;

      beforeEach(async () => {
        storedPhotosWithTag = dumbPhotoGenerator.generatePhotosStoredData(3, {
          tags: [tag],
        });
        await dbTestUtils.addStoredPhotosData(storedPhotosWithTag);

        filter = { tagId: tag._id };
      });

      afterEach(async () => {
        const ids = storedPhotosWithTag.map((p) => p._id);
        await dbTestUtils.deletePhotos(ids);
      });

      it("should return the photos whose tags include the required tag", async () => {
        const expectedPhotos = storedPhotosWithTag;

        const result = await photoDataDbMongo.find({ filter });

        expectsTestUtils.expectEqualPhotoArrays(expectedPhotos, result);
        expectsTestUtils.checkAssertions();
      });
    });
  });
});
