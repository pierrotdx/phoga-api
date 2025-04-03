import { ITagDb } from "../../gateways";
import { ITag } from "../../models";

export class ReplaceTag {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(tag: ITag): Promise<void> {
    await this.tagDb.replace(tag);
  }
}
