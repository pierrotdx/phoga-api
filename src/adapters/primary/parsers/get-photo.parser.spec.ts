import { GetPhotoParser } from "./get-photo.parser";

describe("GetPhotoParser", () => {
  let getPhotoParser: GetPhotoParser;

  beforeEach(() => {
    getPhotoParser = new GetPhotoParser();
  });

  it.each`
    field   | data
    ${"id"} | ${{ id: "dumb id" }}
  `("should extract correctly the '$field' field", ({ field, data }) => {
    const parsedData = getPhotoParser.parse(data);
    expect(parsedData).toEqual(data[field]);
    expect.assertions(1);
  });
});
