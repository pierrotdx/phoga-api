import { Request } from "express";

import { ISearchTagFilter, ISearchTagParser } from "../../../../core";

export class SearchTagParser implements ISearchTagParser {
  parse(req: Request): ISearchTagFilter {
    if (!!req?.query?.name) {
      const filter: ISearchTagFilter = { name: req.query.name as string };
      return filter;
    }
  }
}
