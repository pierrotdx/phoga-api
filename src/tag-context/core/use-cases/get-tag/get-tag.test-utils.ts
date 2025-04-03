import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";

import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { TagsTestUtils } from "../tag.test-utils";
import { GetTag } from "./get-tag";

export class GetTagTestUtils {
  private readonly useCase: GetTag;
  private readonly assertionsCounter: IAssertionsCounter;
  private readonly tagsTestUtils: TagsTestUtils;

  readonly dumbTag: ITag = { _id: "dumb-id", value: "dumb-value" };

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new GetTag(this.tagDb);
    this.tagsTestUtils = new TagsTestUtils(this.tagDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async executeUseCase(id: ITag["_id"]): Promise<ITag> {
    return await this.useCase.execute(id);
  }

  async insertTagInDb(tag: ITag): Promise<void> {
    return await this.tagsTestUtils.insertTag(tag);
  }

  async removeTagFromDb(id: ITag["_id"]): Promise<void> {
    await this.tagsTestUtils.removeTagFromDb(id);
  }

  expectTagsToBeEqual(tag1: ITag, tag2: ITag): void {
    expect(tag1).toEqual(tag2);
    this.assertionsCounter.increase();
    this.assertionsCounter.checkAssertions();
  }

  async executeUseCaseAndExpectToThrow(id: ITag["_id"]): Promise<void> {
    try {
      await this.executeUseCase(id);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase();
      this.assertionsCounter.checkAssertions();
    }
  }
}
