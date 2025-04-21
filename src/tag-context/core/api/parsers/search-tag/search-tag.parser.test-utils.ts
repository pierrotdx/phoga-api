import request, { Test } from "supertest";

import { ISearchTagParser } from "../../../../core/models";
import { SearchTagParser } from "./search-tag.parser";
import { ParserTestUtils } from "#shared/test-utils";

export class SearchTagParserTestUtils extends ParserTestUtils<ISearchTagParser> {
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
