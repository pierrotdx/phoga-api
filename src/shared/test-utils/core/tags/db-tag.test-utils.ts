import { ITag, ITagDb } from "#tag-context";

export class DbTagTestUtils {
  constructor(private readonly tagDb: ITagDb) {}

  async insertTagInDb(tag: ITag, creationDate = new Date()): Promise<void> {
    tag.manifest = { creation: creationDate, lastUpdate: creationDate };
    await this.tagDb.insert(tag);
  }

  async insertTagsInDb(tags: ITag[], creationDate = new Date()): Promise<void> {
    const insertAllTag$ = tags.map(async (t) => {
      await this.insertTagInDb(t, creationDate);
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

  async deleteAllTagsFromDb(): Promise<void> {
    const initSearchResult = await this.tagDb.find();
    await this.deleteTagsFromDb(initSearchResult.hits);
  }
}
