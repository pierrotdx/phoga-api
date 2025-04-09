import {
  ISearchTagFilter,
  ISearchTagUseCase,
  ITag,
  ITagDb,
} from "../../../core";

export class SearchTagUseCase implements ISearchTagUseCase {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(filter?: ISearchTagFilter): Promise<ITag[]> {
    return await this.tagDb.find(filter);
  }
}
