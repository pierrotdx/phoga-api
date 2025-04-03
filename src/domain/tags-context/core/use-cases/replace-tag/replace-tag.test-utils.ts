import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";

import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { TagsTestUtils } from "../tag.test-utils";
import { ReplaceTag } from "./replace-tag";

export class ReplaceTagTestUtils {
  private readonly useCase: ReplaceTag;
  private readonly tagsTestUtils: TagsTestUtils;
  private readonly assertionsCounter: IAssertionsCounter;

  readonly tagToReplace: ITag = { _id: "dumb-id", value: "tag to replace" };
  readonly newTag: ITag = { _id: this.tagToReplace._id, value: "new tag" };

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new ReplaceTag(this.tagDb);
    this.tagsTestUtils = new TagsTestUtils(this.tagDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async insertTagInDb(tag: ITag): Promise<void> {
    await this.tagsTestUtils.insertTag(tag);
  }

  async removeTagFromDb(id: ITag["_id"]): Promise<void> {
    return await this.tagsTestUtils.removeTagFromDb(id);
  }

  async executeUseCase(tag: ITag): Promise<void> {
    await this.useCase.execute(tag);
  }

  async expectTagToBeInDb(expectedTag: ITag): Promise<void> {
    const dbTag = await this.tagDb.getById(expectedTag._id);

    expect(dbTag).toEqual(expectedTag);
    this.assertionsCounter.increase();

    this.assertionsCounter.checkAssertions();
  }
}
