import { Counter, ICounter } from "@utils";

import { LoremIpsumGenerator } from "../../lorem-ipsum";
import { UuidGenerator } from "../../uuid";
import { AddPhotoParser } from "./add-photo.parser";
import { AddPhotoParserTestUtils } from "./add-photo.parser.test-utils";

const uuidGenerator = new UuidGenerator();
const loremIpsum = new LoremIpsumGenerator();
const addPhotoParserTestUtils = new AddPhotoParserTestUtils(
  uuidGenerator,
  loremIpsum,
);

describe("AddPhotoParser", () => {
  let addPhotoParser: AddPhotoParser;
  let assertionCounter: ICounter;

  beforeEach(() => {
    addPhotoParser = new AddPhotoParser();
    assertionCounter = new Counter();
  });

  describe("parse", () => {
    it("should parse input data into photo", () => {
      const inputData = addPhotoParserTestUtils.generateValidData();
      const parsedData = addPhotoParser.parse(inputData);
      addPhotoParserTestUtils.expectParsedDataToBeAValidPhotoWithInputFields(
        inputData,
        parsedData,
        assertionCounter,
      );
      const nbAssertions = assertionCounter.get();
      expect.assertions(nbAssertions);
    });

    it("should throw if the parsed data is not a photo", () => {
      const invalidData = addPhotoParserTestUtils.generateValidData();
      invalidData.location = ["test", "test2"] as any;
      expect(() => {
        addPhotoParser.parse(invalidData);
      }).toThrow();
      expect.assertions(1);
    });
  });
});
