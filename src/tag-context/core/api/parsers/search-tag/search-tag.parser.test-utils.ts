import { ParserTestUtils } from "#shared/test-utils";
import request, { Test } from "supertest";

import { ISearchTagParams, ISearchTagParser } from "../../../../core/models";
import { SearchTagParser } from "./search-tag.parser";

export class SearchTagParserTestUtils extends ParserTestUtils<
  ISearchTagParams | undefined,
  ISearchTagParser
> {
  protected testedParser: ISearchTagParser;
  private readonly url = "/";

  constructor() {
    super();
    this.testedParser = new SearchTagParser();
    this.setupApp();
  }

  protected setupRouter(): void {
    this.app.get(this.url, this.requestHandler);
  }

  protected getRequest(queryParams: Record<string, string>): Test {
    return request(this.app).get(this.url).query(queryParams);
  }
}
