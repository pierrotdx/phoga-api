import { ISearchResult } from "#shared/models";

import {
  ISearchTagParams,
  ISearchTagUseCase,
  ITag,
  ITagDb,
} from "../../../core";

export class SearchTagUseCase implements ISearchTagUseCase {
  constructor(private readonly tagDb: ITagDb) {}

  async execute(params?: ISearchTagParams): Promise<ISearchResult<ITag>> {
    return await this.tagDb.find(params?.filter, params?.options);
  }
}
