import { Counter } from "../counter";
import { SharedTestUtils } from "./shared-test-utils";

describe("SharedTestUtils", () => {
  let sharedTestUtils: SharedTestUtils;

  beforeEach(() => {
    sharedTestUtils = new SharedTestUtils();
  });

  describe("checkAssertionsCount", () => {
    const expectAssertionsSpy = jest.spyOn(expect, "assertions");

    beforeEach(() => {
      expectAssertionsSpy.mockReset();
    });

    it.each`
      expectedAssertionsNb
      ${0}
      ${1}
      ${2}
      ${18}
      ${188}
    `(
      "should call `expect.assertions` with the expected assertions nb ($expectedAssertionsNb)",
      ({ expectedAssertionsNb }) => {
        const counter = new Counter();
        counter.increase(expectedAssertionsNb);

        sharedTestUtils.checkAssertionsCount(counter);

        expect(expectAssertionsSpy).toHaveBeenCalledTimes(1);
        expect(expectAssertionsSpy).toHaveBeenLastCalledWith(
          expectedAssertionsNb,
        );
        expect.assertions(2);
      },
    );
  });
});
