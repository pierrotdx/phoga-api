import { ParserTestUtils } from "#shared/test-utils";
import {
  IGetPhotoParams,
  IGetPhotoParser,
  IPhoto,
} from "photo-context/core/models";
import request, { type Test } from "supertest";

import { GetPhotoParser } from "./get-photo.parser";

export class GetPhotoParserTestUtils extends ParserTestUtils<
  IGetPhotoParams,
  IGetPhotoParser
> {
  protected testedParser: IGetPhotoParser = new GetPhotoParser();

  private readonly baseUrl: string = "/";
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

  protected getRequest(id: IPhoto["_id"]): Test {
    const url = this.getUrl(id);
    return request(this.app).get(url);
  }
}
