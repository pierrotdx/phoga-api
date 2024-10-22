import { Collection } from "mongodb";

import { MongoCollection } from "./models";
import { MongoBase } from "./mongo-base";

describe("MongoBase", () => {
  let mongoBase: MongoBase;

  beforeEach(async () => {
    mongoBase = new MongoBase(global.__MONGO_URL__, global.__MONGO_DB_NAME__);
    await mongoBase.open();
  });

  afterEach(async () => {
    await mongoBase.close();
  });

  describe("getCollection", () => {
    it("should return the required Mongo collection", () => {
      const collectionName = MongoCollection.PhotoMetadata;

      const collection = mongoBase.getCollection(collectionName);

      expect(collection).toBeDefined();
      expect(collection instanceof Collection).toBe(true);
      expect(collection.namespace.endsWith(`${collectionName}`)).toBe(true);
      expect.assertions(3);
    });
  });
});
