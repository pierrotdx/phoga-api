import { ITagDb } from "../../gateways";
import { IDeleteTagUseCase, ITag } from "../../models";
import { TagTestUtils } from "../../test-utils";
import { DeleteTagUseCase } from "./delete-tag";

export class DeleteTagTestUtils {
  private readonly useCase: IDeleteTagUseCase;
  private readonly tagsTestUtils: TagTestUtils;

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new DeleteTagUseCase(this.tagDb);
    this.tagsTestUtils = new TagTestUtils(this.tagDb);
  }

  async insertTagInDb(tag: ITag): Promise<void> {
    await this.tagsTestUtils.insertTagInDb(tag);
  }

  async executeUseCase(id: ITag["_id"]): Promise<void> {
    await this.useCase.execute(id);
  }

  async expectTagToBeDeleted(id: ITag["_id"]): Promise<void> {
    await this.tagsTestUtils.expectTagToBeDeleted(id);
    this.tagsTestUtils.checkAssertions();
  }
}
