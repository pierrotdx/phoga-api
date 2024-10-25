import { Counter } from "../counter";
import { ICounter } from "../models";
import { SharedTestUtils } from "./shared-test-utils";

describe("SharedTestUtils", () => {
  let sharedTestUtils: SharedTestUtils;
  let assertionsCounter: ICounter;

  beforeEach(() => {
    sharedTestUtils = new SharedTestUtils();
    assertionsCounter = new Counter();
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

  describe("expectRejection", () => {
    it("should call the input function with the input params, catch the rejection, add add expect assertion", async () => {
      const asyncFnMock = jest.fn(({ test: boolean }) =>
        Promise.reject(new Error("dumb error")),
      );
      const params: Parameters<typeof asyncFnMock> = [{ test: true }];

      await sharedTestUtils.expectRejection({
        asyncFn: asyncFnMock,
        fnParams: params,
        assertionsCounter,
      });

      expectFunctionToBeCalledWithParams(
        asyncFnMock,
        params,
        assertionsCounter,
      );
      sharedTestUtils.checkAssertionsCount(assertionsCounter);
    });
  });
});

function expectFunctionToBeCalledWithParams(
  spy: jest.SpyInstance,
  params: unknown[],
  assertionsCounter: ICounter,
): void {
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenLastCalledWith(...params);
  assertionsCounter.increase(2);
}
