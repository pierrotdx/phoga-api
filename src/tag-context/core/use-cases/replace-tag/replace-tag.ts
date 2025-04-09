import { ITagDb } from "../../gateways";
import { IReplaceTagUseCase, ITag } from "../../models";

export class ReplaceTagUseCase implements IReplaceTagUseCase {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(tag: ITag): Promise<void> {
    await this.tagDb.replace(tag);
  }
}
