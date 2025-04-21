import { SearchPhotoParserTestUtils } from "./search-photo.parser.test-utils";

describe("SearchPhotoParser", () => {
  let testUtils: SearchPhotoParserTestUtils;

  beforeEach(() => {
    testUtils = new SearchPhotoParserTestUtils();
  });

  describe("parse", () => {
    it("should correctly parse the request parameters", async () => {
      const queryParams = testUtils.generateQueryParams();
      const expectedData = testUtils.getExpectedData(queryParams);

      await testUtils.sendRequest(queryParams);

      testUtils.expectResponseStatusCode(200);
      testUtils.expectParsedDataToBe(expectedData);
      testUtils.checkAssertions();
    });
  });
});
