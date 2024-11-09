import { clone } from "ramda";

import { dumbPhotoGenerator } from "@adapters";
import { IPhoto, IRendering, SortDirection } from "@business-logic";
import {
  AssertionsCounter,
  IAssertionsCounter,
  comparePhotoDates,
} from "@utils";

import { MongoManager } from "../../mongo";
import { PhotoMetadataDbMongo } from "./photo-metadata-db.mongo";
import { PhotoMetadataDbMongoTestUtils } from "./photo-metadata-db.mongo.test-utils";

describe("PhotoMetadataDbMongo", () => {
  const storedPhotos = [...dumbPhotoGenerator.generatePhotos(3)];
  let photoMetadataDbMongo: PhotoMetadataDbMongo;
  let mongoManager: MongoManager;
  let testUtils: PhotoMetadataDbMongoTestUtils;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(async () => {
    mongoManager = new MongoManager(
      global.__MONGO_URL__,
      global.__MONGO_DB_NAME__,
    );
    await mongoManager.open();
    photoMetadataDbMongo = new PhotoMetadataDbMongo(mongoManager);
    testUtils = new PhotoMetadataDbMongoTestUtils({
      metadataDb: photoMetadataDbMongo,
    });
    await testUtils.insertPhotosInDbs(storedPhotos);
    assertionsCounter = new AssertionsCounter();
  });

  afterEach(async () => {
    const storedPhotoIds = storedPhotos.map((photo) => photo._id);
    await testUtils.deletePhotosInDbs(storedPhotoIds);
    await mongoManager.close();
  });

  describe(`${PhotoMetadataDbMongo.prototype.insert.name}`, () => {
    let photoToInsert: IPhoto;

    beforeEach(() => {
      photoToInsert = dumbPhotoGenerator.generatePhoto();
    });

    afterEach(async () => {
      await testUtils.deletePhotoIfNecessary(photoToInsert._id);
    });

    it("should insert a doc with the photo metadata and photo id", async () => {
      const docBefore = await testUtils.getDocFromDb(photoToInsert._id);
      await photoMetadataDbMongo.insert(photoToInsert);
      const docAfter = await testUtils.getDocFromDb(photoToInsert._id);
      await testUtils.expectDocToHaveBeenInserted(
        docBefore,
        docAfter,
        assertionsCounter,
      );
      testUtils.expectDocToMatchExpectedPhoto(
        photoToInsert,
        docAfter,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`${PhotoMetadataDbMongo.prototype.getById.name}`, () => {
    it("should return the photo metadata of the doc matching the input id", async () => {
      const storedPhoto = storedPhotos[0];
      const photoMetadata = await photoMetadataDbMongo.getById(storedPhoto._id);
      expect(photoMetadata).toEqual(storedPhoto.metadata);
      expect.assertions(1);
    });
  });

  describe(`${PhotoMetadataDbMongo.prototype.replace.name}`, () => {
    it("should replace the required doc with the input photo metadata", async () => {
      const storedPhoto = storedPhotos[0];
      const docBefore = await testUtils.getDocFromDb(storedPhoto._id);
      const replacingPhoto = dumbPhotoGenerator.generatePhoto({
        _id: storedPhoto._id,
      });
      await photoMetadataDbMongo.replace(replacingPhoto);
      const docAfter = await testUtils.getDocFromDb(storedPhoto._id);
      testUtils.expectDocToMatchExpectedPhoto(
        storedPhoto,
        docBefore,
        assertionsCounter,
      );
      testUtils.expectDocToMatchExpectedPhoto(
        replacingPhoto,
        docAfter,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`${PhotoMetadataDbMongo.prototype.delete.name}`, () => {
    it("should delete the doc matching the input id", async () => {
      const storedPhoto = storedPhotos[0];
      const docBefore = await testUtils.getDocFromDb(storedPhoto._id);
      await photoMetadataDbMongo.delete(storedPhoto._id);
      testUtils.expectDocToMatchExpectedPhoto(
        storedPhoto,
        docBefore,
        assertionsCounter,
      );
      const docAfter = await testUtils.getDocFromDb(storedPhoto._id);
      expect(docAfter).toBeUndefined();
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });
  });

  describe(`${PhotoMetadataDbMongo.prototype.find.name}`, () => {
    it("should return the docs in DB", async () => {
      const photos = await photoMetadataDbMongo.find();
      testUtils.expectMatchingPhotoArrays(
        storedPhotos,
        photos,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });

    describe("+ rendering.date", () => {
      const ascendingPhotos = clone(storedPhotos).sort(comparePhotoDates);
      const descendingPhotos = clone(ascendingPhotos).reverse();
      it.each`
        case            | rendering                                  | expectedResult
        ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}  | ${ascendingPhotos}
        ${"descending"} | ${{ dateOrder: SortDirection.Descending }} | ${descendingPhotos}
      `(
        "should sort the returned docs by date in $case order when required",
        async ({
          expectedResult,
          rendering,
        }: {
          expectedResult: IPhoto[];
          rendering: IRendering;
        }) => {
          const result = await photoMetadataDbMongo.find(rendering);
          testUtils.expectMatchingPhotoArrays(
            expectedResult,
            result,
            assertionsCounter,
          );
          assertionsCounter.checkAssertions();
        },
      );
    });

    describe("+ rendering.size", () => {
      it.each`
        rendering
        ${{ size: 1 }}
        ${{ size: 2 }}
        ${{ size: 3 }}
      `(
        "should return at most $rendering.size results when required",
        async ({ rendering }: { rendering: IRendering }) => {
          const result = await photoMetadataDbMongo.find(rendering);
          expect(result.length).toEqual(rendering.size);
          expect.assertions(1);
        },
      );
    });

    describe("+ rendering.from", () => {
      const ascendingPhotos = clone(storedPhotos).sort(comparePhotoDates);
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
          const expectedPhoto = ascendingPhotos[docIndex];
          const result = await photoMetadataDbMongo.find(rendering);
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
