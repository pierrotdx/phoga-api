import { isEmpty } from "ramda";

import { IRendering, ISearchPhotoOptions } from "@domain";
import { ISearchPhotoParser } from "@http-server";
import { ImageSize, assertSearchPhotoOptions } from "@shared";

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
    const { size, from, dateOrder, width, height } = data || {};
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
    const imageSize: ImageSize = {};
    if (width) {
      imageSize.width = parseInt(width as string);
    }
    if (height) {
      imageSize.height = parseInt(height as string);
    }
    if (!isEmpty(imageSize)) {
      searchOptions.imageSize = imageSize;
    }
  }
}
