import { isSearchPhotoOptions } from "./is-search-photo-options";

describe("IsSearchPhotoOptions", () => {
  it.each`
    case                                  | candidate                        | expectedResult
    ${"is empty"}                         | ${{}}                            | ${false}
    ${"'excludeImages' is a boolean"}     | ${{ excludeImages: true }}       | ${true}
    ${"'excludeImages' is a boolean"}     | ${{ excludeImages: false }}      | ${true}
    ${"'excludeImages' is a boolean"}     | ${{ excludeImages: 1 }}          | ${false}
    ${"'excludeImages' is a boolean"}     | ${{ excludeImages: 0 }}          | ${false}
    ${"'excludeImages' is not a boolean"} | ${{ excludeImages: "false" }}    | ${false}
    ${"'rendering' is valid"}             | ${{ rendering: { size: 10 } }}   | ${true}
    ${"'rendering' is not valid"}         | ${{ rendering: { size: "10" } }} | ${false}
  `(
    "should return '$expectedResult' if candidate is $case",
    ({ candidate, expectedResult }) => {
      const isValidSearchPhotoOptions = isSearchPhotoOptions(candidate);
      expect(isValidSearchPhotoOptions).toBe(expectedResult);
      expect.assertions(1);
    },
  );
});
