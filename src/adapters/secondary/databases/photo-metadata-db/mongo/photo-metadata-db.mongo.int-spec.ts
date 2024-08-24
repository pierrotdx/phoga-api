import { IPhoto, Photo } from "@business-logic";

import { MongoBase, MongoCollection } from "../../mongo";
import { PhotoMetadataDbMongo } from "./photo-metadata-db.mongo";

describe("PhotoMetadataDbMongo", () => {
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

const photoToInsert = new Photo("14018c6f-7205-48dd-9070-2610bdc56b6c", {
  metadata: {
    date: new Date(),
    description: "erignerignerigneirgnering",
    location: "iegnerigniergneri",
    titles: ["tznzeonr", "iergnerisgner"],
  },
});

const photoInDbFromStart = new Photo("7583bb57-ee95-4d4b-ada2-aac914aec428", {
  metadata: {
    location: "dumb location zoefnzeifnze rueygerugn",
    description: "dumb description oeirngeroingerijgn",
    titles: ["dumb titlte 1 po,goerng", "dumb title 2 eorignerkgnerigujne"],
    date: new Date(),
  },
});

const replacingPhoto = new Photo(photoInDbFromStart._id, {
  metadata: {
    location: "oeinrgiuergnierugning",
    date: new Date(),
    description: "ezirgneirtngp,ozoing pzef, eifzin apzo,d oef",
    titles: ["éizefnziefn", "riegnierngreijgnerij", "oekgoerkg"],
  },
});
