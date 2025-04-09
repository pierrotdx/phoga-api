import { GetTagParserTestUtils } from "./get-tag.parser.test-utils";

describe("GetTagParser", () => {
  let testUtils: GetTagParserTestUtils;

  beforeEach(() => {
    testUtils = new GetTagParserTestUtils();
  });

  describe("parser", () => {
    it("should correctly parse the request parameters", async () => {
      const expectedData = "tag-id";

      await testUtils.sendRequest(expectedData);

      testUtils.expectResponseStatusCode(200);
      testUtils.expectParsedDataToBe(expectedData);
      testUtils.checkAssertions();
    });
  });
});
