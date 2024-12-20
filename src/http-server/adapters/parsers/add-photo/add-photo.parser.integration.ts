import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import { LoremIpsumGenerator, UuidGenerator } from "@shared";

import { AddPhotoParser } from "./add-photo.parser";
import { AddPhotoParserTestUtils } from "./add-photo.parser.test-utils";

const uuidGenerator = new UuidGenerator();
const loremIpsum = new LoremIpsumGenerator();
const testUtils = new AddPhotoParserTestUtils(uuidGenerator, loremIpsum);

describe("AddPhotoParser", () => {
  let addPhotoParser: AddPhotoParser;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(() => {
    addPhotoParser = new AddPhotoParser();
    assertionsCounter = new AssertionsCounter();
  });

  describe("parse", () => {
    it("should parse input data into photo", async () => {
      const inputData = await testUtils.generateValidData();
      const parsedData = addPhotoParser.parse(inputData);
      testUtils.expectParsedDataToBeAValidPhotoWithInputFields(
        inputData,
        parsedData,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });

    it("should throw if the parsed data is not a photo", async () => {
      const invalidData = await testUtils.generateValidData();
      invalidData.location = ["test", "test2"] as any;
      expect(() => {
        addPhotoParser.parse(invalidData);
      }).toThrow();
      expect.assertions(1);
    });
  });
});
