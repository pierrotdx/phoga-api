import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { ISearchResult, IUseCase } from "#shared/models";
import { ITag, ITagDb } from "#tag-context";
import { equals, omit } from "ramda";

import { DbTagTestUtils } from "./db-tag.test-utils";

export class TagTestUtils extends DbTagTestUtils {
  private readonly assertionsCounter: IAssertionsCounter;

  constructor(tagDb: ITagDb) {
    super(tagDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async expectTagToBeDeleted(id: ITag["_id"]): Promise<void> {
    const dbTag = await this.getTagFromDb(id);

    expect(dbTag).toBeUndefined();
    this.assertionsCounter.increase();
  }

  expectTagsToBeEqual(tag1: ITag, tag2: ITag): void {
    expect(tag1).toEqual(tag2);
    this.assertionsCounter.increase();
  }

  async expectTagToBeInDb(
    expectedTag: ITag,
    excludeManifestCheck = false,
  ): Promise<void> {
    const dbTag = await this.getTagFromDb(expectedTag._id);

    if (excludeManifestCheck) {
      expect(omit(["manifest"], dbTag)).toEqual(
        omit(["manifest"], expectedTag),
      );
    } else {
      expect(dbTag).toEqual(expectedTag);
    }
    this.assertionsCounter.increase();
  }

  async executeUseCaseAndExpectToThrow(
    useCaseExecute: IUseCase<unknown>["execute"],
    ...useCaseParams: unknown[]
  ): Promise<void> {
    try {
      await useCaseExecute(useCaseParams);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase();
    }
  }

  checkAssertions(): void {
    this.assertionsCounter.checkAssertions();
  }

  private expectEqualTagArrays(tags1: ITag[], tags2: ITag[]): void {
    expect(tags2.length).toBe(tags1.length);
    this.assertionsCounter.increase();

    tags1.forEach((tag1) => {
      const isInTags2 = tags2.some((tag2) => equals(tag1, tag2));
      expect(isInTags2).toBe(true);
      this.assertionsCounter.increase();
    });
  }

  expectSearchResultToBe(
    expectedSearchResult: ISearchResult<ITag>,
    searchResult: ISearchResult<ITag>,
  ): void {
    this.expectEqualTagArrays(expectedSearchResult.hits, searchResult.hits);
    expect(searchResult.totalCount).toBe(expectedSearchResult.totalCount);
    this.assertionsCounter.increase();
  }
}
