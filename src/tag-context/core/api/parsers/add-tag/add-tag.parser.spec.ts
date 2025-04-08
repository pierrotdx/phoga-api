import { ITag } from "tag-context/core/models";

import { AddTagParserTestUtils } from "./add-tag.parser.test-utils";

describe("AddTagParser", () => {
  let testUtils: AddTagParserTestUtils;

  beforeEach(() => {
    testUtils = new AddTagParserTestUtils();
  });

  describe("parser", () => {
    it("should correctly parse the request payload", async () => {
      const expectedData: ITag = { _id: "tag-id", name: "the name" };

      await testUtils.sendRequest(expectedData);

      testUtils.expectResponseStatusCode(200);
      testUtils.expectParsedDataToBe(expectedData);
      testUtils.checkAssertions();
    });
  });
});
