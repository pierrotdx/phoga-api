import request, { Test } from "supertest";

import { IAddTagParser, ITag } from "../../../../core";
import { TagParserTestUtils } from "../tag.parser.test-utils";
import { AddTagParser } from "./add-tag.parser";

export class AddTagParserTestUtils extends TagParserTestUtils<IAddTagParser> {
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
