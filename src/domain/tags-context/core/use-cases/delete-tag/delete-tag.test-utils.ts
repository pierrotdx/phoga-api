import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";

import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { TagsTestUtils } from "../tag.test-utils";
import { DeleteTag } from "./delete-tag";

export class DeleteTagTestUtils {
  readonly tagToDelete: ITag = { _id: "dumb-id", value: "the tag to delete" };

  private readonly useCase: DeleteTag;
  private readonly tagsTestUtils: TagsTestUtils;
  private readonly assertionsCounter: IAssertionsCounter;

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new DeleteTag(this.tagDb);
    this.tagsTestUtils = new TagsTestUtils(this.tagDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async insertTagInDb(tag: ITag): Promise<void> {
    await this.tagsTestUtils.insertTag(tag);
  }

  async executeUseCase(id: ITag["_id"]): Promise<void> {
    await this.useCase.execute(id);
  }

  async expectTagToBeDeleted(id: ITag["_id"]): Promise<void> {
    const dbTag = await this.tagsTestUtils.getById(id);

    expect(dbTag).toBeUndefined();
    this.assertionsCounter.increase();

    this.assertionsCounter.checkAssertions();
  }
}
