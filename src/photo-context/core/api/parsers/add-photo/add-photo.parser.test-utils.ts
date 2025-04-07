import { IAssertionsCounter } from "#shared/assertions-counter";
import { ILoremIpsumGenerator } from "#shared/lorem-ipsum";
import { IUuidGenerator } from "#shared/uuid";
import express, { Express, NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import request from "supertest";

import { isPhoto } from "../../../assertions";
import { IPhoto } from "../../../models";

export class AddPhotoParserTestUtils {
  private app: Express;
  private readonly url = "/";

  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsum: ILoremIpsumGenerator,
  ) {}

  setReqHandler = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ) => {
    this.app = express();
    this.app.post(this.url, handler);
  };

  async sendRequest(data: Awaited<ReturnType<typeof this.generateValidData>>) {
    const testReq = request(this.app)
      .post(this.url)
      .set("Accept", "multipart/form-data")
      .expect(200);
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "imageBuffer") {
        testReq.field(key, value);
      }
    });
    testReq.attach("image", data.imageBuffer);
    return testReq;
  }

  async generateValidData() {
    const imageBuffer = await this.generateImageBuffer();
    return {
      _id: this.uuidGenerator.generate(),
      imageBuffer,
      date: new Date().toISOString(),
      description: this.loremIpsum.generateSentences(4).join(" "),
      location: this.loremIpsum.generateWords(1).join(),
      titles: this.loremIpsum.generateWords(3),
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

  expectParsedDataToBeAValidPhotoWithInputFields(
    inputData: Awaited<ReturnType<typeof this.generateValidData>>,
    parsedData: unknown,
    assertionsCounter: IAssertionsCounter,
  ) {
    const isValidPhoto = isPhoto(parsedData);
    expect(isValidPhoto).toBe(true);
    assertionsCounter.increase();
    if (!isValidPhoto) {
      return;
    }

    this.expectPhotoToMatchInputFields(
      inputData,
      parsedData,
      assertionsCounter,
    );
  }

  private expectPhotoToMatchInputFields(
    inputData: Awaited<ReturnType<typeof this.generateValidData>>,
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ) {
    expect(photo._id).toEqual(inputData._id);
    expect(photo.imageBuffer).toEqual(inputData.imageBuffer);
    expect(photo.metadata?.date).toEqual(new Date(inputData.date));
    expect(photo.metadata?.description).toEqual(inputData.description);
    expect(photo.metadata?.titles).toEqual(inputData.titles);
    expect(photo.metadata?.location).toEqual(inputData.location);
    assertionsCounter.increase(6);
  }
}
