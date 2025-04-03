import { ITagDb } from "../../gateways";
import { ITag } from "../../models";

export class DeleteTag {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(id: ITag["_id"]): Promise<void> {
    await this.tagDb.delete(id);
  }
}
