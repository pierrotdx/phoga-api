import { IRendering, SortDirection } from "#shared/models";
import { ParserTestUtils } from "#shared/test-utils";
import { IUuidGenerator, UuidGenerator } from "#shared/uuid";
import { isEmpty } from "ramda";
import request, { Test } from "supertest";

import {
  ISearchPhotoFilter,
  ISearchPhotoOptions,
  ISearchPhotoParams,
  ISearchPhotoParser,
} from "../../../models";
import { SearchPhotoParser } from "./search-photo.parser";

type TQueryParams = ReturnType<
  typeof SearchPhotoParserTestUtils.prototype.generateQueryParams
>;

export class SearchPhotoParserTestUtils extends ParserTestUtils<ISearchPhotoParser> {
  protected testedParser: ISearchPhotoParser = new SearchPhotoParser();
  private readonly url = "/";

  private readonly uuidGenerator: IUuidGenerator = new UuidGenerator();

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

  generateQueryParams(dateOrder: string = SortDirection.Ascending) {
    return {
      size: Math.floor(Math.random() * 100).toString(),
      from: Math.floor(Math.random() * 100).toString(),
      dateOrder,
      tagId: this.uuidGenerator.generate(),
    };
  }

  getExpectedData(queryParams: TQueryParams): ISearchPhotoParams {
    const params: ISearchPhotoParams = {};
    this.addFilter(params, queryParams);
    this.addOptions(params, queryParams);
    return params;
  }

  private addFilter(
    params: ISearchPhotoParams,
    queryParams: TQueryParams,
  ): void {
    const filter: ISearchPhotoFilter = {};
    if (queryParams.tagId) {
      filter.tagId = queryParams.tagId;
    }
    if (isEmpty(filter)) {
      return;
    }
    params.filter = filter;
  }

  private addOptions(
    params: ISearchPhotoParams,
    queryParams: TQueryParams,
  ): void {
    const options: ISearchPhotoOptions = {};
    this.addRendering(options, queryParams);
    if (isEmpty(options)) {
      return;
    }
    params.options = options;
  }

  private addRendering(
    options: ISearchPhotoOptions,
    queryParams: TQueryParams,
  ): void {
    if (queryParams.dateOrder) {
      options.dateOrder = queryParams.dateOrder as SortDirection;
    }
    if (queryParams.from) {
      options.from = parseInt(queryParams.from);
    }
    if (queryParams.size) {
      options.size = parseInt(queryParams.size);
    }
  }
}
