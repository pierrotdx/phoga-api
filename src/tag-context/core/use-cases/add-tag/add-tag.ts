import { ITagDb } from "../../gateways";
import { IAddTagUseCase, ITag } from "../../models";

export class AddTagUseCase implements IAddTagUseCase {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(tag: ITag): Promise<void> {
    await this.checkExistence(tag._id);
    await this.tagDb.insert(tag);
  }

  private async checkExistence(id: ITag["_id"]): Promise<void> {
    const tag = await this.tagDb.getById(id);
    if (tag) {
      throw new Error(`tag with id '${tag._id}' already exists`);
    }
  }
}
