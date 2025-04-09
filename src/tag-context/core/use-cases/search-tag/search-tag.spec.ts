import { TagDbFake } from "../../../adapters";
import { ISearchTagFilter, ITag, ITagDb } from "../../../core/";
import { SearchTagTestUtils } from "./search-tag.test-utils";

describe("SearchTagUseCase", () => {
  let tagDb: ITagDb;
  let testUtils: SearchTagTestUtils;

  beforeEach(() => {
    tagDb = new TagDbFake();
    testUtils = new SearchTagTestUtils(tagDb);
  });

  describe("execute", () => {
    const dbTags: ITag[] = [
      { _id: "tag-1", name: "abc" },
      { _id: "tag-2", name: "abd" },
      { _id: "tag-3", name: "efg" },
    ];

    beforeEach(async () => {
      await testUtils.insertTagsInDb(dbTags);
    });

    afterEach(async () => {
      await testUtils.deleteTagsFromDb(dbTags);
    });

    describe("when there is no filter", () => {
      it("should return all the tags in the db", async () => {
        const result = await testUtils.executeTestedUseCase();

        const expectedResult = dbTags;
        testUtils.expectEqualTagArrays(expectedResult, result);
      });
    });

    describe("when there is a filter", () => {
      let filter: ISearchTagFilter;

      describe("when there are no tags in db matching the filter", () => {
        beforeEach(() => {
          filter = { name: "hello " };
        });

        it("should return an empty array", async () => {
          const result = await testUtils.executeTestedUseCase(filter);

          const expectedResult = [];
          testUtils.expectEqualTagArrays(expectedResult, result);
        });
      });

      describe("- `filter.name`", () => {
        let expectedTags: ITag[];

        beforeEach(() => {
          filter = { name: "ab" };
          expectedTags = [dbTags[0], dbTags[1]];
        });

        it("should return tags whose name starts with the requested name filter", async () => {
          const result = await testUtils.executeTestedUseCase(filter);

          testUtils.expectEqualTagArrays(result, expectedTags);
        });
      });
    });
  });
});
