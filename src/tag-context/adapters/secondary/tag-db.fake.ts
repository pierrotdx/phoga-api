import { ITag, ITagDb } from "../../core";

export class TagDbFake implements ITagDb {
  private readonly tags: ITag[] = [];

  async insert(tag: ITag): Promise<void> {
    this.tags.push(tag);
  }

  async getById(id: ITag["_id"]): Promise<ITag> {
    return this.tags.find((t) => t._id === id);
  }

  async delete(id: ITag["_id"]): Promise<void> {
    const tagIndex = this.getTagIndex(id);
    if (tagIndex >= 0) {
      this.tags.splice(tagIndex, 1);
    }
  }

  private getTagIndex(id: ITag["_id"]): number {
    return this.tags.findIndex((t) => t._id === id);
  }

  async replace(tag: ITag): Promise<void> {
    const tagIndex = this.getTagIndex(tag._id);
    if (tagIndex < 0) {
      return await this.insert(tag);
    }
    this.tags[tagIndex] = tag;
  }
}
