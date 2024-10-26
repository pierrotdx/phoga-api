import { IPhoto } from "@business-logic";
import { imageBufferEncoding } from "@http-server";
import {
  IAssertionsCounter,
  ILoremIpsumGenerator,
  IUuidGenerator,
  isPhoto,
} from "@utils";

export class AddPhotoParserTestUtils {
  constructor(
    private readonly uuidGenerator: IUuidGenerator,
    private readonly loremIpsum: ILoremIpsumGenerator,
  ) {}

  generateValidData() {
    return {
      _id: this.uuidGenerator.generate(),
      imageBuffer: Buffer.from(
        this.loremIpsum.generateSentences(1).join(),
        imageBufferEncoding,
      ),
      date: new Date().toISOString(),
      description: this.loremIpsum.generateSentences(4).join(" "),
      location: this.loremIpsum.generateWords(1).join(),
      titles: this.loremIpsum.generateWords(3),
    };
  }

  expectParsedDataToBeAValidPhotoWithInputFields(
    inputData: ReturnType<typeof this.generateValidData>,
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
    inputData: ReturnType<typeof this.generateValidData>,
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
