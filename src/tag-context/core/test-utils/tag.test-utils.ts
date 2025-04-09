import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { IUseCase } from "#shared/models";
import { equals } from "ramda";

import { ITagDb } from "../gateways";
import { ITag } from "../models";
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

  async expectTagToBeInDb(expectedTag: ITag): Promise<void> {
    const dbTag = await this.getTagFromDb(expectedTag._id);

    expect(dbTag).toEqual(expectedTag);
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

  expectEqualTagArrays(tags1: ITag[], tags2: ITag[]): void {
    expect(tags1.length).toBe(tags2.length);
    this.assertionsCounter.increase();

    tags1.forEach((tag1) => {
      const isInTags2 = tags2.some((tag2) => equals(tag1, tag2));
      expect(isInTags2).toBe(true);
      this.assertionsCounter.increase();
    });
  }
}
