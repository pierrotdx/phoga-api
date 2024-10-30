import { isUuid } from "./is-uuid";

describe("isUuid", () => {
  it.each`
    case                               | value
    ${"candidate is not a string"}     | ${1234}
    ${"candidate is not a valid uuid"} | ${"erikgjn erijgn zifne"}
  `("should return false if $case", ({ value }) => {
    expect(isUuid(value)).toBe(false);
    expect.assertions(1);
  });

  it.each`
    value
    ${"f7efb444-7699-11ef-b864-0242ac120002"}
    ${"cbb5fc89-a585-4fb2-879f-f28fb8d35e42"}
    ${"9bab348c-7cf1-4c8f-920f-8a5363cf4fdd"}
    ${"65bc4ea6-769a-11ef-b864-0242ac120002"}
  `("should return true for $value", ({ value }) => {
    expect(isUuid(value)).toBe(true);
    expect.assertions(1);
  });
});
