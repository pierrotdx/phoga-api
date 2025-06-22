import { isSearchPhotoOptions } from "./is-search-photo-options";

describe("IsSearchPhotoOptions", () => {
  it.each`
    case                     | candidate         | expectedResult
    ${"is empty"}            | ${{}}             | ${false}
    ${"'size' is valid"}     | ${{ size: 10 }}   | ${true}
    ${"'size' is not valid"} | ${{ size: "10" }} | ${false}
  `(
    "should return '$expectedResult' if candidate is $case",
    ({ candidate, expectedResult }) => {
      const isValidSearchPhotoOptions = isSearchPhotoOptions(candidate);
      expect(isValidSearchPhotoOptions).toBe(expectedResult);
      expect.assertions(1);
    },
  );
});
