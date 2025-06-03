import { ISearchTagParams } from "../../../models";
import { SearchTagParserTestUtils } from "./search-tag.parser.test-utils";

describe("SearchTagParser", () => {
  let testUtils: SearchTagParserTestUtils;

  beforeEach(() => {
    testUtils = new SearchTagParserTestUtils();
  });

  it("should correctly parse the query parameters", async () => {
    const queryParams = { name: "tag name", from: 2, size: 4 };

    await testUtils.sendRequest(queryParams);

    testUtils.expectResponseStatusCode(200);
    const expectedParsedData: ISearchTagParams = {
      filter: { name: queryParams.name },
      options: {
        from: queryParams.from,
        size: queryParams.size,
      },
    };
    testUtils.expectParsedDataToBe(expectedParsedData);
    testUtils.checkAssertions();
  });
});
