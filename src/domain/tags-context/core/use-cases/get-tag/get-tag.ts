import { ITagDb } from "../../gateways";
import { ITag } from "../../models";

export class GetTag {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(id: ITag["_id"]): Promise<ITag> {
    const tag = await this.tagDb.getById(id);
    if (!tag) {
      throw new Error("tag not found");
    }
    return tag;
  }
}
