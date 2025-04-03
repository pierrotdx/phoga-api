import { ITag } from "@domain/tags-context/core";
import { ITagDb } from "@domain/tags-context/core/gateways";

export class TagDbFake implements ITagDb {
  private tags: ITag[] = [];

  async insert(tag: ITag): Promise<void> {
    this.tags.push(tag);
  }

  async getById(id: ITag["_id"]): Promise<ITag> {
    return this.tags.find((t) => t._id === id);
  }

  async delete(id: ITag["_id"]): Promise<void> {
    this.tags = this.tags.filter((t) => t._id === id);
  }

  async replace(tag: ITag): Promise<void> {
    const tagIndex = this.tags.findIndex((t) => t._id === tag._id);
    if (tagIndex < 0) {
      return await this.insert(tag);
    }
    this.tags[tagIndex] = tag;
  }
}
