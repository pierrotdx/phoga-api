import { ITagDb } from "../../gateways";
import { IGetTagUseCase, ITag } from "../../models";
import { TagTestUtils } from "../../test-utils";
import { GetTagUseCase } from "./get-tag";

export class GetTagTestUtils {
  private readonly useCase: IGetTagUseCase;
  private readonly tagsTestUtils: TagTestUtils;

  constructor(private readonly tagDb: ITagDb) {
    this.useCase = new GetTagUseCase(this.tagDb);
    this.tagsTestUtils = new TagTestUtils(this.tagDb);
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
    this.tagsTestUtils.expectTagsToBeEqual(tag1, tag2);
    this.tagsTestUtils.checkAssertions();
  }

  async executeUseCaseAndExpectToThrow(id: ITag["_id"]): Promise<void> {
    await this.tagsTestUtils.executeUseCaseAndExpectToThrow(
      this.executeUseCase,
      id,
    );
    this.tagsTestUtils.checkAssertions();
  }
}
