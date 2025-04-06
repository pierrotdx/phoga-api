import { UuidGenerator } from "@shared/uuid";

import { DeletePhotoParser } from "./delete-photo.parser";

describe("DeletePhotoParser", () => {
  let deletePhotoParser: DeletePhotoParser;
  const id = new UuidGenerator().generate();

  beforeEach(() => {
    deletePhotoParser = new DeletePhotoParser();
  });

  it.each`
    inputData | expectedData
    ${{ id }} | ${id}
  `(
    "should extract correctly from $inputData to $expectedData",
    ({ expectedData, inputData }) => {
      const parsedData = deletePhotoParser.parse(inputData);
      expect(parsedData).toEqual(expectedData);
      expect.assertions(1);
    },
  );
});
