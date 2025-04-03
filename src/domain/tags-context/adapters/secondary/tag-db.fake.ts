import { ITag } from "@domain/tags-context/core";
import { ITagDb } from "@domain/tags-context/core/gateways";

export class TagDbFake implements ITagDb {
  private readonly tags: ITag[] = [];

  async insert(tag: ITag): Promise<void> {
    this.tags.push(tag);
  }

  async getById(id: ITag["_id"]): Promise<ITag> {
    return this.tags.find((t) => t._id === id);
  }
}
