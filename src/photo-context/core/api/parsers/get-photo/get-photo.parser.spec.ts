import { UuidGenerator } from "@shared/uuid";

import { GetPhotoParser } from "./get-photo.parser";

describe("GetPhotoParser", () => {
  let getPhotoParser: GetPhotoParser;
  const id = new UuidGenerator().generate();

  beforeEach(() => {
    getPhotoParser = new GetPhotoParser();
  });

  it.each`
    inputData | expectedData
    ${{ id }} | ${id}
  `(
    "should extract correctly from $inputData to $expectedData",
    ({ expectedData, inputData }) => {
      const parsedData = getPhotoParser.parse(inputData);
      expect(parsedData).toEqual(expectedData);
      expect.assertions(1);
    },
  );
});
