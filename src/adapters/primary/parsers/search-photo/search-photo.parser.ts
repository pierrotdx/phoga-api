import { isEmpty } from "ramda";

import { IRendering, ISearchPhotoOptions } from "@business-logic";
import { ISearchPhotoParser } from "@http-server";
import { assertSearchPhotoOptions } from "@utils";

export class SearchPhotoParser implements ISearchPhotoParser {
  parse(data: any): ISearchPhotoOptions {
    if (isEmpty(data)) {
      return;
    }
    const searchOptions: ISearchPhotoOptions = {};
    this.setExcludeImages(data, searchOptions);
    this.setRendering(data, searchOptions);
    assertSearchPhotoOptions(searchOptions);
    return searchOptions;
  }

  private setExcludeImages(
    data: any,
    searchOptions: ISearchPhotoOptions,
  ): void {
    if (data.excludeImages) {
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