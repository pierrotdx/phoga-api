import { ITag, ITagDb } from "../../core";

export class DbTagTestUtils {
  constructor(private readonly tagDb: ITagDb) {}

  async insertTagInDb(tag: ITag): Promise<void> {
    await this.tagDb.insert(tag);
  }

  async insertTagsInDb(tags: ITag[]): Promise<void> {
    const insertAllTag$ = tags.map(async (t) => {
      await this.insertTagInDb(t);
    });
    await Promise.all(insertAllTag$);
  }

  async deleteTagsFromDb(tags: ITag[]): Promise<void> {
    const deleteAllTags$ = tags.map((t) => this.deleteTagFromDb(t._id));
    await Promise.all(deleteAllTags$);
  }

  async deleteTagFromDb(id: ITag["_id"]): Promise<void> {
    await this.tagDb.delete(id);
  }

  async getTagFromDb(id: ITag["_id"]): Promise<ITag> {
    return await this.tagDb.getById(id);
  }
}
