import { ISearchResult } from "#shared/models";

import { TagDbFake } from "../../../adapters";
import {
  ISearchTagFilter,
  ISearchTagOptions,
  ITag,
  ITagDb,
} from "../../../core/";
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
        const searchResult = await testUtils.executeTestedUseCase();

        const expectedSearchResult: ISearchResult<ITag> = {
          hits: dbTags,
          totalCount: dbTags.length,
        };
        testUtils.expectSearchResultToBe(expectedSearchResult, searchResult);
      });
    });

    describe("when there is a filter", () => {
      let filter: ISearchTagFilter;

      describe("when there are no tags in db matching the filter", () => {
        beforeEach(() => {
          filter = { name: "hello " };
        });

        it("should return an empty array", async () => {
          const searchResult = await testUtils.executeTestedUseCase({ filter });

          const expectedSearchResult: ISearchResult<ITag> = {
            hits: [],
            totalCount: 0,
          };
          testUtils.expectSearchResultToBe(expectedSearchResult, searchResult);
        });
      });

      describe("- `filter.name`", () => {
        let expectedSearchResult: ISearchResult<ITag>;

        beforeEach(() => {
          filter = { name: "ab" };
          const matchingTags = [dbTags[0], dbTags[1]];
          expectedSearchResult = {
            hits: matchingTags,
            totalCount: matchingTags.length,
          };
        });

        it("should return tags whose name starts with the requested name filter", async () => {
          const searchResult = await testUtils.executeTestedUseCase({ filter });

          testUtils.expectSearchResultToBe(expectedSearchResult, searchResult);
        });
      });
    });

    describe("when options are requested", () => {
      let options: ISearchTagOptions = {};

      describe('when the "size" option is requested', () => {
        const expectedSize: ISearchTagOptions["size"] = 2;

        beforeEach(() => {
          options.size = expectedSize;
        });

        it("should return a number of tags with at most the requested size", async () => {
          const searchResult = await testUtils.executeTestedUseCase({
            options,
          });

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
          const searchResult = await testUtils.executeTestedUseCase({
            options,
          });

          const firstResult = searchResult.hits[0];
          expect(firstResult).toEqual(expectedFirstResult);
          expect.assertions(1);
        });
      });
    });
  });
});
