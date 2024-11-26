import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";

import { SearchPhotoParser } from "./search-photo.parser";
import { SearchPhotoParserTestUtils } from "./search-photo.parser.test-utils";

describe("SearchPhotoParser", () => {
  const testUtils = new SearchPhotoParserTestUtils();
  let searchPhotoParser: SearchPhotoParser;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(() => {
    searchPhotoParser = new SearchPhotoParser();
    assertionsCounter = new AssertionsCounter();
  });

  describe("parse", () => {
    it.each`
      inputData
      ${testUtils.generateInputData()}
      ${testUtils.generateInputData()}
      ${testUtils.generateInputData()}
    `(
      "should parse the generated input data into search options",
      ({ inputData }) => {
        const parsedData = searchPhotoParser.parse(inputData);

        testUtils.expectValidType(parsedData, assertionsCounter);
        testUtils.expectParsedDataMatchingInputData(
          parsedData,
          inputData,
          assertionsCounter,
        );
        assertionsCounter.checkAssertions();
      },
    );

    it.each`
      inputData                      | expectedData
      ${{ width: 15 }}               | ${{ imageSize: { width: 15 } }}
      ${{ height: 654 }}             | ${{ imageSize: { height: 654 } }}
      ${{ width: 752, height: 984 }} | ${{ imageSize: { width: 752, height: 984 } }}
    `(
      "should extract `imageSize` correctly from $inputData",
      ({ expectedData, inputData }) => {
        const parsedData = searchPhotoParser.parse(inputData);
        expect(parsedData).toEqual(expectedData);
        expect.assertions(1);
      },
    );
  });
});
