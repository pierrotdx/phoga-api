import { ISearchTagFilter } from "tag-context/core/models";

import { SearchTagParserTestUtils } from "./search-tag.parser.test-utils";

describe("SearchTagParser", () => {
  let testUtils: SearchTagParserTestUtils;

  beforeEach(() => {
    testUtils = new SearchTagParserTestUtils();
  });

  it("should correctly parse the query parameters", async () => {
    const queryParams = { name: "tag name" };

    await testUtils.sendRequest(queryParams);

    testUtils.expectResponseStatusCode(200);
    const expectedParsedData: ISearchTagFilter = { name: queryParams.name };
    testUtils.expectParsedDataToBe(expectedParsedData);
    testUtils.checkAssertions();
  });
});
