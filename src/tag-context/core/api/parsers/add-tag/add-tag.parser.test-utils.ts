import { ParserTestUtils } from "#shared/test-utils";
import request, { Test } from "supertest";

import { IAddTagParser, ITag } from "../../../../core";
import { AddTagParser } from "./add-tag.parser";

export class AddTagParserTestUtils extends ParserTestUtils<
  ITag,
  IAddTagParser
> {
  protected readonly testedParser: IAddTagParser = new AddTagParser();

  private readonly url = "/";

  constructor() {
    super();
    this.setupApp();
  }

  protected setupRouter(): void {
    this.app.post(this.url, this.requestHandler);
  }

  protected getRequest(tag: ITag): Test {
    return request(this.app).post(this.url).send(tag);
  }
}
