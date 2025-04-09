import { ITag, ITagDb } from "../..";

export class DbTagTestUtils {
  constructor(private readonly tagDb: ITagDb) {}

  async insertTagInDb(tag: ITag): Promise<void> {
    await this.tagDb.insert(tag);
  }

  async deleteTagsFromDb(tags: ITag[]): Promise<void> {
    const removePromises$ = tags.map((t) => this.deleteTagFromDb(t._id));
    await Promise.all(removePromises$);
  }

  async deleteTagFromDb(id: ITag["_id"]): Promise<void> {
    await this.tagDb.delete(id);
  }

  async getTagFromDb(id: ITag["_id"]): Promise<ITag> {
    return await this.tagDb.getById(id);
  }
}
