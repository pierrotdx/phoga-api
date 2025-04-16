import { TagTestUtils } from "#shared/test-utils";

import {
  ISearchTagFilter,
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

  async executeTestedUseCase(filter?: ISearchTagFilter): Promise<ITag[]> {
    return this.testedUseCase.execute(filter);
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

  expectEqualTagArrays(tags1: ITag[], tags2: ITag[]): void {
    this.tagTestUtils.expectEqualTagArrays(tags1, tags2);
    this.tagTestUtils.checkAssertions();
  }
}
