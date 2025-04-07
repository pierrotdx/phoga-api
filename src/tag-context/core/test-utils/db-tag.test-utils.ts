import { ITag, ITagDb } from "../..";

export class DbTagTestUtils {
  constructor(private readonly tagDb: ITagDb) {}

  async insertTag(tag: ITag): Promise<void> {
    await this.tagDb.insert(tag);
  }

  async removeTagsFromDb(tags: ITag[]): Promise<void> {
    const removePromises$ = tags.map((t) => this.removeTagFromDb(t._id));
    await Promise.all(removePromises$);
  }

  async removeTagFromDb(id: ITag["_id"]): Promise<void> {
    await this.tagDb.delete(id);
  }

  async getById(id: ITag["_id"]): Promise<ITag> {
    return await this.tagDb.getById(id);
  }
}
