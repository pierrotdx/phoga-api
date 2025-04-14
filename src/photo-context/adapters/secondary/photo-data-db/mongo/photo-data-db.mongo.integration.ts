import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { IRendering, SortDirection } from "#shared/models";
import { omit } from "ramda";

import { IPhoto, IPhotoStoredData } from "../../../../core";
import { PhotoDataDbMongo } from "./photo-data-db.mongo";
import { PhotoDataDbMongoTestUtils } from "./photo-data-db.mongo.test-utils";

describe("PhotoDataDbMongo", () => {
  let storedPhotos: IPhoto[];

  const testUtils = new PhotoDataDbMongoTestUtils(
    global.__MONGO_URL__,
    global.__MONGO_DB_NAME__,
    { PhotoData: global.__MONGO_PHOTO_BASE_COLLECTION__ },
  );
  let photoDataDbMongo: PhotoDataDbMongo;
  let assertionsCounter: IAssertionsCounter;
  const timeout = 10000; // generating multiple stored photos

  beforeEach(async () => {
    await testUtils.internalSetup();
    photoDataDbMongo = testUtils.photoDataDb;
    storedPhotos = [
      await testUtils.generatePhotoDataStore(),
      await testUtils.generatePhotoDataStore(),
      await testUtils.generatePhotoDataStore(),
    ];
    await testUtils.insertPhotosInDbs(storedPhotos);
    assertionsCounter = new AssertionsCounter();
  }, timeout);

  afterEach(async () => {
    const storedPhotoIds = storedPhotos.map((photo) => photo._id);
    await testUtils.deletePhotosInDbs(storedPhotoIds);
    await testUtils.internalTeardown();
  });

  describe(`${PhotoDataDbMongo.prototype.insert.name}`, () => {
    let photoToInsert: IPhotoStoredData;

    beforeEach(async () => {
      photoToInsert = await testUtils.generatePhotoDataStore();
    });

    afterEach(async () => {
      await testUtils.deletePhotoIfNecessary(photoToInsert._id);
    });

    it("should insert a doc with the photo base data", async () => {
      const docBefore = await testUtils.getDocFromDb(photoToInsert._id);
      await photoDataDbMongo.insert(photoToInsert);
      await testUtils.expectDocToBeInsertedWithCorrectId(
        docBefore,
        photoToInsert,
        assertionsCounter,
      );
    });
  });

  describe(`${PhotoDataDbMongo.prototype.getById.name}`, () => {
    it("should return the photo base data of the doc matching the input id", async () => {
      const storedPhotoData = omit(["imageBuffer"], storedPhotos[0]);
      const photoData = await photoDataDbMongo.getById(storedPhotoData._id);
      expect(photoData).toEqual(storedPhotoData);
      expect.assertions(1);
    });
  });

  describe(`${PhotoDataDbMongo.prototype.replace.name}`, () => {
    it("should replace the required doc with the input photo base data", async () => {
      const storedPhoto = storedPhotos[0];
      const docBefore = await testUtils.getDocFromDb(storedPhoto._id);
      const replacingPhoto = await testUtils.generatePhotoDataStore({
        _id: storedPhoto._id,
      });
      await photoDataDbMongo.replace(replacingPhoto);
      await testUtils.expectPhotoDataToReplaceDoc(
        storedPhoto,
        replacingPhoto,
        docBefore,
        assertionsCounter,
      );
    });
  });

  describe(`${PhotoDataDbMongo.prototype.delete.name}`, () => {
    it("should delete the doc matching the input id", async () => {
      const storedPhoto = storedPhotos[0];
      const docBefore = await testUtils.getDocFromDb(storedPhoto._id);
      await photoDataDbMongo.delete(storedPhoto._id);
      await testUtils.expectDocToBeDeleted(
        storedPhoto,
        docBefore,
        assertionsCounter,
      );
    });
  });

  describe(`${PhotoDataDbMongo.prototype.find.name}`, () => {
    it("should return the docs in DB", async () => {
      const photos = await photoDataDbMongo.find();
      testUtils.expectMatchingPhotoArrays(
        storedPhotos,
        photos,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });

    describe("- rendering.date", () => {
      it.each`
        case            | rendering
        ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
        ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
      `(
        "should sort the returned docs by date in $case order when required",
        async ({ rendering }: { rendering: IRendering }) => {
          const expectedResult = testUtils.getPhotosSortedByDate(
            storedPhotos,
            rendering.dateOrder,
          );
          const result = await photoDataDbMongo.find(rendering);
          testUtils.expectMatchingPhotoArrays(
            expectedResult,
            result,
            assertionsCounter,
          );
          assertionsCounter.checkAssertions();
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
          const result = await photoDataDbMongo.find(rendering);
          expect(result.length).toEqual(rendering.size);
          expect.assertions(1);
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
          const ascendingPhotos = testUtils.getPhotosSortedByDate(
            storedPhotos,
            SortDirection.Ascending,
          );
          const expectedPhoto = ascendingPhotos[docIndex];
          const result = await photoDataDbMongo.find(rendering);
          testUtils.expectMatchingPhotos(
            expectedPhoto,
            result[0],
            assertionsCounter,
          );
          assertionsCounter.checkAssertions();
        },
      );
    });
  });
});
