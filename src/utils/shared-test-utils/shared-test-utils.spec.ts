import { AssertionsCounter } from "../assertions-counter";
import { IAssertionsCounter, ICounter } from "../models";
import { SharedTestUtils } from "./shared-test-utils";

describe("SharedTestUtils", () => {
  let sharedTestUtils: SharedTestUtils;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(() => {
    sharedTestUtils = new SharedTestUtils();
    assertionsCounter = new AssertionsCounter();
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
      assertionsCounter.checkAssertions();
    });
  });
});

function expectFunctionToBeCalledWithParams(
  spy: jest.SpyInstance,
  params: unknown[],
  assertionsCounter: IAssertionsCounter,
): void {
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenLastCalledWith(...params);
  assertionsCounter.increase(2);
}
