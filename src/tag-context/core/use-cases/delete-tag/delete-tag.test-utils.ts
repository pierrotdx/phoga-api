import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { TagTestUtils } from "../../test-utils";
import { DeleteTag } from "./delete-tag";

export class DeleteTagTestUtils {
  private readonly useCase: DeleteTag;
  private readonly tagsTestUtils: TagTestUtils;

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new DeleteTag(this.tagDb);
    this.tagsTestUtils = new TagTestUtils(this.tagDb);
  }

  async insertTagInDb(tag: ITag): Promise<void> {
    await this.tagsTestUtils.insertTag(tag);
  }

  async executeUseCase(id: ITag["_id"]): Promise<void> {
    await this.useCase.execute(id);
  }

  async expectTagToBeDeleted(id: ITag["_id"]): Promise<void> {
    await this.tagsTestUtils.expectTagToBeDeleted(id);
    this.tagsTestUtils.checkAssertions();
  }
}
