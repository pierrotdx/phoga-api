import { Collection } from "mongodb";

import { MongoManager } from "./mongo-manager";

describe("MongoManager", () => {
  let mongoManager: MongoManager;
  let mongoPhotoDataCollection: string;
  let mongoTagCollection: string;

  beforeEach(async () => {
    mongoPhotoDataCollection = global.__MONGO_PHOTO_BASE_COLLECTION__;
    mongoTagCollection = global.__MONGO_TAG_COLLECTION__;
    mongoManager = new MongoManager(
      global.__MONGO_URL__,
      global.__MONGO_DB_NAME__,
      { PhotoData: mongoPhotoDataCollection, Tags: mongoTagCollection },
    );
    await mongoManager.open();
  });

  afterEach(async () => {
    await mongoManager.close();
  });

  describe("getCollection", () => {
    it("should return the required Mongo collection", () => {
      const collection = mongoManager.getCollection(mongoPhotoDataCollection);

      expect(collection).toBeDefined();
      expect(collection instanceof Collection).toBe(true);
      expect(collection.namespace.endsWith(`${mongoPhotoDataCollection}`)).toBe(
        true,
      );
      expect.assertions(3);
    });
  });
});
