import { compareDates } from "./compare-dates";

describe("compare dates", () => {
  it.each`
    aDate                     | bDate                     | expectedResult
    ${new Date("2000-01-01")} | ${new Date("1888-08-08")} | ${1}
    ${new Date("1888-08-08")} | ${new Date("2000-01-01")} | ${-1}
    ${new Date("2000-01-01")} | ${new Date("2000-01-01")} | ${0}
  `(
    "should return $expectedResult when aDate=$aDate and bDate=$bDate",
    ({ aDate, bDate, expectedResult }) => {
      const result = compareDates(aDate, bDate);
      expect(result).toBe(expectedResult);
      expect.assertions(1);
    },
  );

  it.each`
    case                      | aDate                     | bDate
    ${"aDate is `undefined`"} | ${undefined}              | ${new Date("2000-01-01")}
    ${"aDate is `null`"}      | ${null}                   | ${new Date("2000-01-01")}
    ${"aDate is not a Date"}  | ${"stringDate"}           | ${new Date("2000-01-01")}
    ${"bDate is `undefined`"} | ${new Date("2000-01-01")} | ${undefined}
    ${"bDate is `null`"}      | ${new Date("2000-01-01")} | ${null}
    ${"bDate is not a Date"}  | ${new Date("2000-01-01")} | ${"stringDate"}
  `("should throw if $case", ({ aDate, bDate }) => {
    expect(() => {
      compareDates(aDate, bDate);
    }).toThrow();
    expect.assertions(1);
  });
});
