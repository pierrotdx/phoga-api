import { IRendering } from "#shared/models";
import { Request } from "express";
import { isEmpty } from "ramda";

import { assertSearchPhotoOptions } from "../../../assertions";
import {
  ISearchPhotoFilter,
  ISearchPhotoOptions,
  ISearchPhotoParams,
  ISearchPhotoParser,
} from "../../../models";

export class SearchPhotoParser implements ISearchPhotoParser {
  parse(req: Request): ISearchPhotoParams {
    const query = req.query;
    if (isEmpty(query)) {
      return;
    }
    const params: ISearchPhotoParams = {};
    this.addFilter(params, query);
    this.addOptions(params, query);
    return isEmpty(params) ? undefined : params;
  }

  private addFilter(params: ISearchPhotoParams, query: any): void {
    const filter: ISearchPhotoFilter = {};
    if (query.tagId) {
      filter.tagId = query.tagId as string;
    }
    if (isEmpty(filter)) {
      return;
    }
    params.filter = filter;
  }

  private addOptions(params: ISearchPhotoParams, query: any): void {
    const options: ISearchPhotoOptions = {};
    this.setExcludeImages(query, options);
    this.setRendering(query, options);
    assertSearchPhotoOptions(options);
    if (isEmpty(options)) {
      return;
    }
    params.options = options;
  }

  private setExcludeImages(
    data: any,
    searchOptions: ISearchPhotoOptions,
  ): void {
    if (data?.excludeImages) {
      searchOptions.excludeImages = data.excludeImages === "true";
    }
  }

  private setRendering(data: any, searchOptions: ISearchPhotoOptions): void {
    const { size, from, dateOrder } = data || {};
    const rendering: IRendering = {};
    if (size) {
      rendering.size = parseInt(size as string);
    }
    if (from) {
      rendering.from = parseInt(from as string);
    }
    if (dateOrder) {
      rendering.dateOrder = dateOrder;
    }
    if (!isEmpty(rendering)) {
      searchOptions.rendering = rendering;
    }
  }
}
