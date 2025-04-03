import { IAssertionsCounter } from "@assertions-counter";

import { ITagDb } from "../../gateways";
import { ITag } from "../../models";

export class AddTagTestUtils {
  constructor(
    private readonly tagDb: ITagDb,
    private readonly assertionsCounter: IAssertionsCounter,
  ) {}

  async expectTagToBeInDb(expectedTag: ITag): Promise<void> {
    const tag = await this.tagDb.getById(expectedTag._id);
    expect(tag).toEqual(expectedTag);
    this.assertionsCounter.increase();
  }
}
