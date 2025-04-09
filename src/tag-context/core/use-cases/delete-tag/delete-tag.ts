import { ITagDb } from "../../gateways";
import { IDeleteTagUseCase, ITag } from "../../models";

export class DeleteTagUseCase implements IDeleteTagUseCase {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(id: ITag["_id"]): Promise<void> {
    await this.tagDb.delete(id);
  }
}
