import { ISearchResult } from "#shared/models";
import { TagTestUtils } from "#shared/test-utils";

import {
  ISearchTagParams,
  ISearchTagUseCase,
  ITag,
  ITagDb,
} from "../../../core/";
import { SearchTagUseCase } from "./search-tag";

export class SearchTagTestUtils {
  private readonly testedUseCase: ISearchTagUseCase;

  private readonly tagTestUtils: TagTestUtils;

  constructor(tagDb: ITagDb) {
    this.testedUseCase = new SearchTagUseCase(tagDb);
    this.tagTestUtils = new TagTestUtils(tagDb);
  }

  async executeTestedUseCase(
    params?: ISearchTagParams,
  ): Promise<ISearchResult<ITag>> {
    return this.testedUseCase.execute(params);
  }

  async insertTagsInDb(tags: ITag[]): Promise<void> {
    const insertAllTags$ = tags.map(async (t) => {
      await this.tagTestUtils.insertTagInDb(t);
    });
    await Promise.all(insertAllTags$);
  }

  async deleteTagsFromDb(tags: ITag[]): Promise<void> {
    await this.tagTestUtils.deleteTagsFromDb(tags);
  }

  expectSearchResultToBe(
    expectedSearchResult: ISearchResult<ITag>,
    searchResult: ISearchResult<ITag>,
  ): void {
    this.tagTestUtils.expectSearchResultToBe(
      expectedSearchResult,
      searchResult,
    );
    this.tagTestUtils.checkAssertions();
  }
}
