import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { TagTestUtils } from "../../test-utils";
import { AddTag } from "./add-tag";

export class AddTagTestUtils {
  private readonly useCase: AddTag;
  private readonly tagsTestUtils: TagTestUtils;

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new AddTag(this.tagDb);
    this.tagsTestUtils = new TagTestUtils(this.tagDb);
  }

  async executeUseCase(tag: ITag): Promise<void> {
    await this.useCase.execute(tag);
  }

  async expectTagToBeInDb(expectedTag: ITag): Promise<void> {
    await this.tagsTestUtils.expectTagToBeInDb(expectedTag);
    this.tagsTestUtils.checkAssertions();
  }

  async executeUseCaseAndExpectToThrow(tag: ITag): Promise<void> {
    await this.tagsTestUtils.executeUseCaseAndExpectToThrow(
      this.executeUseCase,
      tag,
    );
    this.tagsTestUtils.checkAssertions();
  }

  async removeTagFromDb(id: ITag["_id"]): Promise<void> {
    await this.tagsTestUtils.removeTagFromDb(id);
  }
}
