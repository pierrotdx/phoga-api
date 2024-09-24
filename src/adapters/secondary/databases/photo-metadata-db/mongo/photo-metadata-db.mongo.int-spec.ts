import { clone } from "ramda";

import { IPhoto, SortDirection } from "@business-logic";
import {
  comparePhotoDates,
  deletePhotoInDbs,
  deletePhotosInDbs,
  dumbPhotoGenerator,
  insertPhotosInDbs,
} from "@utils";

import { MongoBase, MongoCollection } from "../../mongo";
import { PhotoMetadataDbMongo } from "./photo-metadata-db.mongo";

function generatePhoto(id?: string): IPhoto {
  const photo = dumbPhotoGenerator.generate({ _id: id });
  delete photo.imageBuffer;
  return photo;
}

describe("PhotoMetadataDbMongo", () => {
  const photoInDbFromStart = generatePhoto();
  const replacingPhoto = generatePhoto(photoInDbFromStart._id);
  const photoToInsert = generatePhoto();
  const storedPhotos = [photoInDbFromStart, generatePhoto(), generatePhoto()];

  let photoMetadataDbMongo: PhotoMetadataDbMongo;
  let mongoBase: MongoBase;

  beforeEach(async () => {
    mongoBase = new MongoBase(global.__MONGO_URL__, global.__MONGO_DB_NAME__);
    await mongoBase.open();
    photoMetadataDbMongo = new PhotoMetadataDbMongo(mongoBase);
    await insertPhotosInDbs(storedPhotos, { metadataDb: photoMetadataDbMongo });
  });

  afterEach(async () => {
    const storedPhotoIds = storedPhotos.map((photo) => photo._id);
    await deletePhotosInDbs(storedPhotoIds, {
      metadataDb: photoMetadataDbMongo,
    });
    await mongoBase.close();
  });

  describe("insert", () => {
    afterEach(async () => {
      await deletePhotoInDbs(photoToInsert._id, {
        metadataDb: photoMetadataDbMongo,
      });
    });

    it("should insert a doc with the photo metadata and photo id", async () => {
      const docBefore = await getPhotoMetadataById(
        mongoBase,
        photoToInsert._id,
      );

      await photoMetadataDbMongo.insert(photoToInsert);

      expect(docBefore).toBeUndefined();

      const docAfter = await getPhotoMetadataById(mongoBase, photoToInsert._id);
      expect(docAfter).toBeDefined();
      expect(docAfter._id).toBe(photoToInsert._id);
      delete docAfter._id;
      expect(docAfter).toEqual(photoToInsert.metadata);
      expect.assertions(4);
    });
  });

  describe("getById", () => {
    it("should return the photo metadata of the doc matching the input id", async () => {
      const photoMetadata = await photoMetadataDbMongo.getById(
        photoInDbFromStart._id,
      );

      expect(photoMetadata).toEqual(photoInDbFromStart.metadata);
      expect.assertions(1);
    });
  });

  describe("replace", () => {
    it("should replace the targeted doc with the input photo metadata", async () => {
      const docBefore = await getPhotoMetadataById(
        mongoBase,
        photoInDbFromStart._id,
      );

      await photoMetadataDbMongo.replace(replacingPhoto);

      const docAfter = await getPhotoMetadataById(
        mongoBase,
        replacingPhoto._id,
      );

      expect(docBefore._id).toBe(photoInDbFromStart._id);
      expect(docAfter._id).toBe(photoInDbFromStart._id);
      delete docBefore._id;
      expect(docBefore).toEqual(photoInDbFromStart.metadata);
      delete docAfter._id;
      expect(docAfter).toEqual(replacingPhoto.metadata);
      expect.assertions(4);
    });
  });

  describe("delete", () => {
    it("should delete the doc matching the input id", async () => {
      const docBefore = await getPhotoMetadataById(
        mongoBase,
        photoInDbFromStart._id,
      );

      await photoMetadataDbMongo.delete(photoInDbFromStart._id);

      expect(docBefore).toBeDefined();
      expect(docBefore._id).toBe(photoInDbFromStart._id);
      const docAfter = await getPhotoMetadataById(
        mongoBase,
        photoInDbFromStart._id,
      );
      expect(docAfter).toBeUndefined();
      expect.assertions(3);
    });
  });

  describe("find", () => {
    it("should return the docs in DB", async () => {
      const photos = await photoMetadataDbMongo.find();
      expect(photos.length).toBe(storedPhotos.length);
      photos.forEach((photo) => {
        expect(storedPhotos).toContainEqual(photo);
      });
      expect.assertions(photos.length + 1);
    });

    describe("+ rendering.date", () => {
      const ascendingPhotos = clone(storedPhotos).sort(comparePhotoDates);
      const descendingPhotos = clone(ascendingPhotos).reverse();
      it.each`
        case            | rendering                             | expectedResult
        ${"ascending"}  | ${{ date: SortDirection.Ascending }}  | ${ascendingPhotos}
        ${"descending"} | ${{ date: SortDirection.Descending }} | ${descendingPhotos}
      `(
        "should sort the returned docs by date in $case order when required",
        async ({ expectedResult, rendering }) => {
          const result = await photoMetadataDbMongo.find(rendering);
          expect(result).toEqual(expectedResult);
          expect.assertions(1);
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
        async ({ rendering }) => {
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
        rendering                                     | docIndex
        ${{ from: 1, date: SortDirection.Ascending }} | ${0}
        ${{ from: 2, date: SortDirection.Ascending }} | ${1}
        ${{ from: 3, date: SortDirection.Ascending }} | ${2}
      `(
        "should return results starting from the $docIndex-th stored photo",
        async ({ rendering, docIndex }) => {
          const result = await photoMetadataDbMongo.find(rendering);
          expect(result[0]).toEqual(ascendingPhotos[docIndex]);
          expect.assertions(1);
        },
      );
    });
  });
});

async function getPhotoMetadataById(mongoBase: MongoBase, _id: string) {
  const collection = mongoBase.getCollection(MongoCollection.PhotoMetadata);
  const doc = await collection.findOne({ _id });
  return doc ?? undefined;
}
