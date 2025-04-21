import { IPhotoDataDb } from "#photo-context";
import { TagTestUtils } from "#shared/test-utils";

import { ITagDb } from "../../gateways";
import { IDeleteTagUseCase, ITag } from "../../models";
import { DeleteTagUseCase } from "./delete-tag";

export class DeleteTagTestUtils {
  private readonly useCase: IDeleteTagUseCase;
  private readonly tagsTestUtils: TagTestUtils;

  constructor(tagDb: ITagDb, photoDataDb: IPhotoDataDb) {
    this.useCase = new DeleteTagUseCase(tagDb, photoDataDb);
    this.tagsTestUtils = new TagTestUtils(tagDb);
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
