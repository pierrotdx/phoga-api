import { ITagDb } from "../../gateways";
import { IReplaceTagUseCase, ITag } from "../../models";
import { TagTestUtils } from "../../test-utils";
import { ReplaceTagUseCase } from "./replace-tag";

export class ReplaceTagTestUtils {
  private readonly useCase: IReplaceTagUseCase;
  private readonly tagsTestUtils: TagTestUtils;

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new ReplaceTagUseCase(this.tagDb);
    this.tagsTestUtils = new TagTestUtils(this.tagDb);
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
    await this.tagsTestUtils.expectTagToBeInDb(expectedTag);
    this.tagsTestUtils.checkAssertions();
  }
}
