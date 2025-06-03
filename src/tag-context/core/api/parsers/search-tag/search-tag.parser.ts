import { Request } from "express";
import { isEmpty } from "ramda";

import {
  ISearchTagFilter,
  ISearchTagOptions,
  ISearchTagParams,
  ISearchTagParser,
} from "../../../../core";

export class SearchTagParser implements ISearchTagParser {
  parse(req: Request): ISearchTagParams {
    const query = req?.query;
    if (!query) {
      return;
    }

    const result: ISearchTagParams = {};

    const filter = this.getFilter(req);
    if (filter) {
      result.filter = filter;
    }

    const options = this.getOptions(req);
    if (options) {
      result.options = options;
    }

    return isEmpty(result) ? undefined : result;
  }

  private getFilter(req: Request): ISearchTagFilter | undefined {
    const filter: ISearchTagFilter = {};
    const query = req.query;
    if (query?.name) {
      filter.name = query.name as string;
    }
    return isEmpty(filter) ? undefined : filter;
  }

  private getOptions(req: Request): ISearchTagOptions | undefined {
    const options: ISearchTagOptions = {};
    const query = req.query;
    if (query?.from !== undefined) {
      options.from = parseInt(query.from as string);
    }
    if (query?.size !== undefined) {
      options.size = parseInt(query.size as string);
    }
    return isEmpty(options) ? undefined : options;
  }
}
