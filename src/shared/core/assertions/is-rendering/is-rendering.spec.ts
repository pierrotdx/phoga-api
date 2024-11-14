import { SortDirection } from "@domain";

import { isRendering } from "./is-rendering";

describe("isRendering", () => {
  it.each`
    case                         | candidate                                  | expectedResult
    ${"has valid 'size'"}        | ${{ size: 10 }}                            | ${true}
    ${"has invalid 'size'"}      | ${{ size: "10" }}                          | ${false}
    ${"has valid 'from'"}        | ${{ from: 10 }}                            | ${true}
    ${"has invalid 'from'"}      | ${{ from: "10" }}                          | ${false}
    ${"has valid 'dateOrder'"}   | ${{ dateOrder: SortDirection.Ascending }}  | ${true}
    ${"has valid 'dateOrder'"}   | ${{ dateOrder: SortDirection.Descending }} | ${true}
    ${"has invalid 'dateOrder'"} | ${{ dateOrder: "random" }}                 | ${false}
    ${"has invalid 'dateOrder'"} | ${{ dateOrder: 10 }}                       | ${false}
  `(
    "should return '$expectedResult' if candidate is $case",
    ({ candidate, expectedResult }) => {
      const isRenderingAssertion = isRendering(candidate);
      expect(isRenderingAssertion).toBe(expectedResult);
      expect.assertions(1);
    },
  );
});
