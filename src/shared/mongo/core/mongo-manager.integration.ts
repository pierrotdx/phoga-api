import { Collection } from "mongodb";

import { MongoManager } from "./mongo-manager";

describe("MongoManager", () => {
  let mongoManager: MongoManager;
  let mongoMetadataCollection: string;

  beforeEach(async () => {
    mongoMetadataCollection = global.__MONGO_PHOTO_METADATA_COLLECTION__;
    mongoManager = new MongoManager(
      global.__MONGO_URL__,
      global.__MONGO_DB_NAME__,
      { PhotoMetadata: mongoMetadataCollection },
    );
    await mongoManager.open();
  });

  afterEach(async () => {
    await mongoManager.close();
  });

  describe("getCollection", () => {
    it("should return the required Mongo collection", () => {
      const collection = mongoManager.getCollection(mongoMetadataCollection);

      expect(collection).toBeDefined();
      expect(collection instanceof Collection).toBe(true);
      expect(collection.namespace.endsWith(`${mongoMetadataCollection}`)).toBe(
        true,
      );
      expect.assertions(3);
    });
  });
});
