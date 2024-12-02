import fetch from "node-fetch";

import { IAssertionsCounter } from "@assertions-counter";
import { IPhoto } from "@domain";
import { ILoremIpsumGenerator, IUuidGenerator, isPhoto } from "@shared";

export class AddPhotoParserTestUtils {
  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsum: ILoremIpsumGenerator,
  ) {}

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
    const response = await fetch("https://picsum.photos/seed/picsum/200/300");
    return await response.buffer();
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
