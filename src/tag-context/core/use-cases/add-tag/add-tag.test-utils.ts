import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";

import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { TagsTestUtils } from "../tag.test-utils";
import { AddTag } from "./add-tag";

export class AddTagTestUtils {
  readonly dumbTags: ITag[] = [{ _id: "dumb-id-1", name: "test-1" }];

  private readonly useCase: AddTag;
  private readonly tagsTestUtils: TagsTestUtils;
  private readonly assertionsCounter: IAssertionsCounter;

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new AddTag(this.tagDb);
    this.tagsTestUtils = new TagsTestUtils(this.tagDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async executeUseCase(tag: ITag): Promise<void> {
    await this.useCase.execute(tag);
  }

  async expectTagToBeInDb(expectedTag: ITag): Promise<void> {
    const tag = await this.tagDb.getById(expectedTag._id);
    expect(tag).toEqual(expectedTag);
    this.assertionsCounter.increase();
    this.assertionsCounter.checkAssertions();
  }

  async executeUseCaseAndExpectToThrow(tag: ITag): Promise<void> {
    try {
      await this.executeUseCase(tag);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase();
      this.assertionsCounter.checkAssertions();
    }
  }

  async cleanDbFromDumbTags(): Promise<void> {
    await this.tagsTestUtils.removeTagsFromDb(this.dumbTags);
  }
}
