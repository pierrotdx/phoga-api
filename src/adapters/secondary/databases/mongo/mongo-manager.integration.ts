import { Collection } from "mongodb";

import { MongoCollection } from "./models";
import { MongoManager } from "./mongo-manager";

describe("MongoManager", () => {
  let mongoManager: MongoManager;

  beforeEach(async () => {
    mongoManager = new MongoManager(
      global.__MONGO_URL__,
      global.__MONGO_DB_NAME__,
    );
    await mongoManager.open();
  });

  afterEach(async () => {
    await mongoManager.close();
  });

  describe("getCollection", () => {
    it("should return the required Mongo collection", () => {
      const collectionName = MongoCollection.PhotoMetadata;

      const collection = mongoManager.getCollection(collectionName);

      expect(collection).toBeDefined();
      expect(collection instanceof Collection).toBe(true);
      expect(collection.namespace.endsWith(`${collectionName}`)).toBe(true);
      expect.assertions(3);
    });
  });
});
