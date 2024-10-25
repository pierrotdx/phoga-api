import { AssertionsCounter, IAssertionsCounter } from "@utils";

import { SearchPhotoParser } from "./search-photo.parser";
import { SearchPhotoParserTestUtils } from "./search-photo.parser.test-utils";

describe("SearchPhotoParser", () => {
  const searchPhotoParserTestUtils = new SearchPhotoParserTestUtils();
  let searchPhotoParser: SearchPhotoParser;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(() => {
    searchPhotoParser = new SearchPhotoParser();
    assertionsCounter = new AssertionsCounter();
  });

  describe("parse", () => {
    it.each`
      inputData
      ${searchPhotoParserTestUtils.generateInputData()}
      ${searchPhotoParserTestUtils.generateInputData()}
      ${searchPhotoParserTestUtils.generateInputData()}
    `(
      "should parse the generated input data into search options",
      ({ inputData }) => {
        const parsedData = searchPhotoParser.parse(inputData);

        searchPhotoParserTestUtils.expectValidType(
          parsedData,
          assertionsCounter,
        );
        searchPhotoParserTestUtils.expectParsedDataMatchingInputData(
          parsedData,
          inputData,
          assertionsCounter,
        );
        assertionsCounter.checkAssertions();
      },
    );
  });
});
