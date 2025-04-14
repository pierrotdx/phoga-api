import { IRendering, SortDirection } from "#shared/models";
import { ParserTestUtils } from "#shared/test-utils";
import { isEmpty } from "ramda";
import request, { Test } from "supertest";

import { ISearchPhotoOptions, ISearchPhotoParser } from "../../../models";
import { SearchPhotoParser } from "./search-photo.parser";

type TQueryParams = ReturnType<
  typeof SearchPhotoParserTestUtils.prototype.generateQueryParams
>;

export class SearchPhotoParserTestUtils extends ParserTestUtils<ISearchPhotoParser> {
  protected testedParser: ISearchPhotoParser = new SearchPhotoParser();
  private readonly url = "/";

  constructor() {
    super();
    this.setupApp();
  }

  protected setupRouter(): void {
    this.app.get(this.url, this.requestHandler);
  }

  protected getRequest(queryParams: unknown): Test {
    const req = request(this.app).get(this.url).query(queryParams);
    return req;
  }

  generateQueryParams(
    excludesImages: boolean = true,
    dateOrder: string = SortDirection.Ascending,
  ) {
    return {
      excludeImages: JSON.stringify(excludesImages),
      size: Math.floor(Math.random() * 100).toString(),
      from: Math.floor(Math.random() * 100).toString(),
      dateOrder,
    };
  }

  getExpectedData(queryParams: TQueryParams): ISearchPhotoOptions {
    const searchOptions: ISearchPhotoOptions = {};
    const rendering: IRendering = {};
    if (queryParams.excludeImages) {
      searchOptions.excludeImages = JSON.parse(queryParams.excludeImages);
    }
    if (queryParams.dateOrder) {
      rendering.dateOrder = queryParams.dateOrder as SortDirection;
    }
    if (queryParams.from) {
      rendering.from = parseInt(queryParams.from);
    }
    if (queryParams.size) {
      rendering.size = parseInt(queryParams.size);
    }
    if (!isEmpty(rendering)) {
      searchOptions.rendering = rendering;
    }
    return searchOptions;
  }
}
