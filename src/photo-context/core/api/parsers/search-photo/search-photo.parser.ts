import { IRendering } from "#shared/models";
import { Request } from "express";
import { isEmpty } from "ramda";

import { assertSearchPhotoOptions } from "../../../assertions";
import { ISearchPhotoOptions, ISearchPhotoParser } from "../../../models";

export class SearchPhotoParser implements ISearchPhotoParser {
  parse(data: Request): ISearchPhotoOptions {
    const query = data.query;
    if (isEmpty(query)) {
      return;
    }
    const searchOptions: ISearchPhotoOptions = {};
    this.setExcludeImages(query, searchOptions);
    this.setRendering(query, searchOptions);
    assertSearchPhotoOptions(searchOptions);
    return searchOptions;
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
