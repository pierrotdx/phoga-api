import { Counter, sharedTestUtils } from "@utils";

import { SearchPhotoParser } from "./search-photo.parser";
import { SearchPhotoParserTestUtils } from "./search-photo.parser.test-utils";

describe("SearchPhotoParser", () => {
  const searchPhotoParserTestUtils = new SearchPhotoParserTestUtils();
  let searchPhotoParser: SearchPhotoParser;
  let assertionCounter: Counter;

  beforeEach(() => {
    searchPhotoParser = new SearchPhotoParser();
    assertionCounter = new Counter();
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
          assertionCounter,
        );
        searchPhotoParserTestUtils.expectParsedDataMatchingInputData(
          parsedData,
          inputData,
          assertionCounter,
        );
        sharedTestUtils.checkAssertionsCount(assertionCounter);
      },
    );
  });
});
