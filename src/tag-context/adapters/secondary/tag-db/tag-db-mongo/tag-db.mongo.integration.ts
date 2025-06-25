import { ISearchResult } from "#shared/models";

import { ISearchTagFilter, ISearchTagOptions, ITag } from "../../../../core";
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
        const expectedTag: ITag = { ...tagToInsert };

        await testUtils.insert(tagToInsert);

        await testUtils.expectTagToBeInDb(expectedTag);
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
        const result = await testUtils.getById(tagToGet._id);

        await testUtils.expectValuesToMatch(result, undefined);
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
        const expectedTag: ITag = { ...newTag };

        await testUtils.replace(newTag);

        await testUtils.expectTagToBeInDb(expectedTag);
      });
    });

    describe("when there is a tag with the same id in db", () => {
      const tagAlreadyInDb: ITag = { _id: newTag._id, name: "old value" };

      beforeEach(async () => {
        await testUtils.insertDoc(tagAlreadyInDb);
      });

      it("should replace the tag", async () => {
        const expectedTag: ITag = { ...newTag };

        await testUtils.replace(newTag);

        await testUtils.expectTagToBeInDb(expectedTag);
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

  describe("find", () => {
    const dbTags: ITag[] = [
      { _id: "tag-1", name: "aaa" },
      { _id: "tag-2", name: "aab" },
      { _id: "tag-3", name: "ccc" },
    ];

    beforeEach(async () => {
      await testUtils.insertDocs(dbTags);
    });

    afterEach(async () => {
      const tagIds = dbTags.map((t) => t._id);
      await testUtils.deleteDocs(tagIds);
    });

    describe("when there is no filter", () => {
      it("should return the all the tags in the db", async () => {
        const searchResult = await testUtils.find();

        const expectedSearchResult: ISearchResult<ITag> = {
          hits: dbTags,
          totalCount: dbTags.length,
        };
        testUtils.expectSearchResultToBe(expectedSearchResult, searchResult);
      });
    });

    describe("when there is a filter", () => {
      let filter: ISearchTagFilter;

      describe("when there is no match", () => {
        beforeEach(() => {
          filter = { name: "zzz" };
        });

        it("should return an empty array", async () => {
          const searchResult = await testUtils.find(filter);

          const expectedSearchResult: ISearchResult<ITag> = {
            hits: [],
            totalCount: 0,
          };
          testUtils.expectSearchResultToBe(expectedSearchResult, searchResult);
        });
      });

      describe("- `filter.name`", () => {
        let expectedResult: ISearchResult<ITag>;

        beforeEach(() => {
          filter = { name: "aa" };
          const matchingTags = [dbTags[0], dbTags[1]];
          expectedResult = {
            hits: matchingTags,
            totalCount: matchingTags.length,
          };
        });

        it("should return tags whose name starts with the requested name filter", async () => {
          const searchResult = await testUtils.find(filter);

          testUtils.expectSearchResultToBe(expectedResult, searchResult);
        });
      });
    });

    describe("when options are requested", () => {
      const filter = undefined;
      let options: ISearchTagOptions;

      beforeEach(() => {
        options = {};
      });

      describe('when the "size" option is requested', () => {
        const expectedSize: ISearchTagOptions["size"] = 2;

        beforeEach(() => {
          options.size = expectedSize;
        });

        it("should return a number of tags with at most the requested size", async () => {
          const searchResult = await testUtils.find(filter, options);

          expect(searchResult.hits.length).toBeLessThanOrEqual(expectedSize);
          expect.assertions(1);
        });
      });

      describe('when the "from" option is requested', () => {
        const from: ISearchTagOptions["from"] = 2;
        let expectedFirstResult: ITag;

        beforeEach(() => {
          options.from = from;

          expectedFirstResult = dbTags[from - 1];
        });

        it('should return results starting from the requested "from"', async () => {
          const searchResult = await testUtils.find(filter, options);

          const firstResult = searchResult.hits[0];
          expect(firstResult).toEqual(expectedFirstResult);
          expect.assertions(1);
        });
      });
    });
  });
});
