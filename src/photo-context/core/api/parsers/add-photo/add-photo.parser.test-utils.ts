import { ILoremIpsumGenerator } from "#shared/lorem-ipsum";
import { ParserTestUtils } from "#shared/test-utils";
import { IUuidGenerator } from "#shared/uuid";
import fetch from "node-fetch";
import request, { Test } from "supertest";

import {
  IAddPhotoParams,
  IAddPhotoParser,
  IPhoto,
  IPhotoMetadata,
  Photo,
} from "../../../models";
import { AddPhotoParser } from "./add-photo.parser";

type TPayload = Awaited<
  ReturnType<typeof AddPhotoParserTestUtils.prototype.generatePayload>
>;

export class AddPhotoParserTestUtils extends ParserTestUtils<IAddPhotoParser> {
  protected testedParser: IAddPhotoParser;

  private readonly url = "/";

  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsum: ILoremIpsumGenerator,
  ) {
    super();
    this.testedParser = new AddPhotoParser();
    this.setupApp();
  }

  protected setupRouter(): void {
    this.app.post(this.url, this.requestHandler);
  }

  protected getRequest(payload: unknown): Test {
    const req = request(this.app)
      .post(this.url)
      .set("Accept", "multipart/form-data");
    this.addDataToReq(req, payload);
    return req;
  }

  private addDataToReq(req: Test, data: any): void {
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "imageBuffer") {
        req.field(key, value as any);
      }
    });
    req.attach("image", data.imageBuffer);
  }

  async generatePayload() {
    const imageBuffer = await this.generateImageBuffer();
    return {
      _id: this.uuidGenerator.generate(),
      imageBuffer,
      date: new Date().toISOString(),
      description: this.loremIpsum.generateSentences(4).join(" "),
      location: this.loremIpsum.generateWords(1).join(),
      titles: this.loremIpsum.generateWords(3),
      tagIds: [this.uuidGenerator.generate(), this.uuidGenerator.generate()],
    };
  }

  private async generateImageBuffer(): Promise<Buffer> {
    try {
      const response = await fetch("https://picsum.photos/seed/picsum/200/300");
      return await response.buffer();
    } catch (err) {
      throw err;
    }
  }
  getExpectedDataFromPayload(payload: TPayload): IPhoto {
    const expectedData: IAddPhotoParams = new Photo(payload._id, {
      imageBuffer: payload.imageBuffer,
    });
    const metadata: IPhotoMetadata = {
      date: new Date(payload.date),
      description: payload.description,
      location: payload.location,
      titles: payload.titles,
    };
    expectedData.metadata = metadata;
    expectedData.tagIds = payload.tagIds;
    return expectedData;
  }
}
