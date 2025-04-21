import { LoremIpsumGenerator } from "#shared/lorem-ipsum";
import { UuidGenerator } from "#shared/uuid";

import { AddPhotoParserTestUtils } from "./add-photo.parser.test-utils";

const uuidGenerator = new UuidGenerator();
const loremIpsum = new LoremIpsumGenerator();

describe("AddPhotoParser", () => {
  let testUtils: AddPhotoParserTestUtils;

  beforeEach(() => {
    testUtils = new AddPhotoParserTestUtils(uuidGenerator, loremIpsum);
  });

  describe("parse", () => {
    it("should parse input data into photo", async () => {
      const payload = await testUtils.generatePayload();
      const expectedData = testUtils.getExpectedDataFromPayload(payload);

      await testUtils.sendRequest(payload);

      testUtils.expectResponseStatusCode(200);
      testUtils.expectParsedDataToBe(expectedData);
      testUtils.checkAssertions();
    });

    it("should throw if the parsed data is not a photo", async () => {
      const payload = await testUtils.generatePayload();
      const invalidPayload = payload;
      invalidPayload.date = 4 as any;

      await testUtils.sendRequest(invalidPayload);

      testUtils.expectParserToHaveThrown();
      testUtils.expectResponseStatusCode(500);
      testUtils.checkAssertions();
    });
  });
});
