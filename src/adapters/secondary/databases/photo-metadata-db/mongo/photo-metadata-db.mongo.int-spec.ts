import { IPhoto } from "@business-logic";
import { dumbPhotoGenerator } from "@utils";

import { MongoBase, MongoCollection } from "../../mongo";
import { PhotoMetadataDbMongo } from "./photo-metadata-db.mongo";

describe("PhotoMetadataDbMongo", () => {
  const photoToInsert = dumbPhotoGenerator.generate();
  const photoInDbFromStart = dumbPhotoGenerator.generate();
  const replacingPhoto = dumbPhotoGenerator.generate({
    _id: photoInDbFromStart._id,
  });

  let photoMetadataDbMongo: PhotoMetadataDbMongo;
  let mongoBase: MongoBase;

  beforeEach(async () => {
    mongoBase = new MongoBase(global.__MONGO_URL__, global.__MONGO_DB_NAME);
    await mongoBase.open();
    await insertPhotoMetadata(mongoBase, photoInDbFromStart);
    photoMetadataDbMongo = new PhotoMetadataDbMongo(mongoBase);
  });

  afterEach(async () => {
    await deletePhotoMetadata(mongoBase, photoInDbFromStart._id);
    await mongoBase.close();
  });

  describe("insert", () => {
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

    afterEach(async () => {
      await deletePhotoMetadata(mongoBase, photoToInsert._id);
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
});

async function insertPhotoMetadata(mongoBase: MongoBase, photo: IPhoto) {
  await mongoBase.getCollection(MongoCollection.PhotoMetadata).insertOne({
    _id: photo._id,
    ...photo.metadata,
  });
}

async function deletePhotoMetadata(mongoBase: MongoBase, _id: string) {
  await mongoBase
    .getCollection(MongoCollection.PhotoMetadata)
    .deleteOne({ _id });
}

async function getPhotoMetadataById(mongoBase: MongoBase, _id: string) {
  const collection = mongoBase.getCollection(MongoCollection.PhotoMetadata);
  const doc = await collection.findOne({ _id });
  return doc ?? undefined;
}
