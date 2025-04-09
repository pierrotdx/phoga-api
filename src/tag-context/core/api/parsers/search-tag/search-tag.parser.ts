import { Request } from "express";

import { ISearchTagFilter, ISearchTagParser } from "../../../../core";

export class SearchTagParser implements ISearchTagParser {
  parse(data: Request): ISearchTagFilter {
    if (!!data?.query?.name) {
      const filter: ISearchTagFilter = { name: data.query.name as string };
      return filter;
    }
  }
}
