import { ITag } from "../../../core";
import { TagDbMongoTestUtils } from "./tag-db.mongo.test-utils";

describe("TagDbMongo", () => {
  let testUtils: TagDbMongoTestUtils;

  beforeEach(async () => {
    testUtils = new TagDbMongoTestUtils(global);
    await testUtils.globalBeforeEach();
  });

  afterEach(async () => {
    await testUtils.globalAfterEach();
  });

  describe("insert", () => {
    const tagToInsert: ITag = { _id: "tag-1", name: "tag to insert" };

    afterEach(async () => {
      await testUtils.deleteDoc(tagToInsert._id);
    });

    describe("when there is not already a tag with the same id", () => {
      it("should insert the requested tag", async () => {
        await testUtils.insert(tagToInsert);

        await testUtils.expectTagToBeInDb(tagToInsert);
      });
    });

    describe("when there is already a tag with the same id", () => {
      const tagAlreadyInDb: ITag = {
        _id: tagToInsert._id,
        name: "tag already in db",
      };

      beforeEach(async () => {
        await testUtils.insertDoc(tagAlreadyInDb);
      });

      afterEach(async () => {
        await testUtils.deleteDoc(tagAlreadyInDb._id);
      });

      it("should throw an error", async () => {
        await testUtils.expectInsertToThrow(tagToInsert);
      });
    });
  });

  describe("getById", () => {
    const tagToGet: ITag = { _id: "tag-id", name: "tag to get" };

    describe("when the requested tag is not in the db", () => {
      it("should throw an error", async () => {
        await testUtils.expectGetByIdToThrow(tagToGet._id);
      });
    });

    describe("when the requested tag is in the db", () => {
      beforeEach(async () => {
        await testUtils.insertDoc(tagToGet);
      });

      afterEach(async () => {
        await testUtils.deleteDoc(tagToGet._id);
      });

      it("should return the requested tag", async () => {
        const resultTag = await testUtils.getById(tagToGet._id);

        testUtils.expectTagsToBeEqual(resultTag, tagToGet);
      });
    });
  });

  describe("replace", () => {
    const newTag: ITag = { _id: "new-tag", name: "new tag" };

    afterEach(async () => {
      await testUtils.deleteDoc(newTag._id);
    });

    describe("when there is not a tag with the same id in db", () => {
      it("should add the tag to the db", async () => {
        await testUtils.replace(newTag);

        await testUtils.expectTagToBeInDb(newTag);
      });
    });

    describe("when there is a tag with the same id in db", () => {
      const tagAlreadyInDb: ITag = { _id: newTag._id, name: "old value" };

      beforeEach(async () => {
        await testUtils.insertDoc(tagAlreadyInDb);
      });

      it("should replace the tag", async () => {
        await testUtils.replace(newTag);

        await testUtils.expectTagToBeInDb(newTag);
      });
    });
  });

  describe("delete", () => {
    const tagToDelete: ITag = { _id: "tag-to-delete", name: "tag to delete" };

    beforeEach(async () => {
      await testUtils.insertDoc(tagToDelete);
    });

    it("should delete the requested tag", async () => {
      await testUtils.delete(tagToDelete._id);

      await testUtils.expectTagNotToBeInDb(tagToDelete._id);
    });
  });
});
