import { ITagDb } from "../gateways";
import { ITag } from "../models";

export class TagsTestUtils {
  constructor(protected readonly tagDb: ITagDb) {}

  async removeTagsFromDb(tags: ITag[]): Promise<void> {
    const removePromises$ = tags.map((t) => this.removeTagFromDb(t._id));
    await Promise.all(removePromises$);
  }

  private async removeTagFromDb(id: ITag["_id"]): Promise<void> {
    await this.tagDb.delete(id);
  }
}
