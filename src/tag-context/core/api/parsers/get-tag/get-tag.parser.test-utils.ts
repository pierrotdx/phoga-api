import request, { Test } from "supertest";

import { IGetTagParser, ITag } from "../../../../core";
import { GetTagParser } from "./get-tag.parser";
import { ParserTestUtils } from "#shared/test-utils";

export class GetTagParserTestUtils extends ParserTestUtils<IGetTagParser> {
  protected testedParser: IGetTagParser = new GetTagParser();

  private readonly baseUrl = "/";

  constructor() {
    super();
    this.setupApp();
  }

  protected setupRouter(): void {
    const url = this.getUrl(":id");
    this.app.get(url, this.requestHandler);
  }

  private getUrl(id: string): string {
    return `${this.baseUrl}${id}`;
  }

  protected getRequest(id: ITag["_id"]): Test {
    const url = this.getUrl(id);
    return request(this.app).get(url);
  }
}
