import { GetPhotoParserTestUtils } from "./get-photo.parser.test-utils";

describe("GetPhotoParser", () => {
  let testUtils: GetPhotoParserTestUtils;

  beforeEach(() => {
    testUtils = new GetPhotoParserTestUtils();
  });

  describe("parse", () => {
    it("should correctly parse the request path parameter", async () => {
      const expectedData = "photo-id";

      await testUtils.sendRequest(expectedData);

      testUtils.expectResponseStatusCode(200);
      testUtils.expectParsedDataToBe(expectedData);
      testUtils.checkAssertions();
    });
  });
});
