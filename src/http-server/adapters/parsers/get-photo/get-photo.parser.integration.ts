import { UuidGenerator } from "@shared";

import { GetPhotoParser } from "./get-photo.parser";

describe("GetPhotoParser", () => {
  let getPhotoParser: GetPhotoParser;
  const id = new UuidGenerator().generate();

  beforeEach(() => {
    getPhotoParser = new GetPhotoParser();
  });

  it.each`
    inputData                          | expectedData
    ${{ id }}                          | ${{ _id: id }}
    ${{ id, width: 15 }}               | ${{ _id: id, imageSize: { width: 15 } }}
    ${{ id, height: 654 }}             | ${{ _id: id, imageSize: { height: 654 } }}
    ${{ id, width: 752, height: 984 }} | ${{ _id: id, imageSize: { width: 752, height: 984 } }}
  `(
    "should extract correctly from $inputData to $expectedData",
    ({ expectedData, inputData }) => {
      const parsedData = getPhotoParser.parse(inputData);
      expect(parsedData).toEqual(expectedData);
      expect.assertions(1);
    },
  );
});
