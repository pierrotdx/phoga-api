import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";

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
        fnExpectedToReject: asyncFnMock,
        fnParams: params,
        assertionsCounter,
      });
      sharedTestUtils.expectFunctionToBeCalledWith(
        assertionsCounter,
        asyncFnMock,
        ...params,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe("expectFunctionToBeCalledWith", () => {
    it("should call the input function with the input params", () => {
      const dumbFn = jest.fn(({ dumbParam: string }) => {});
      const params = { dumbParam: "some param " };
      dumbFn(params);
      sharedTestUtils.expectFunctionToBeCalledWith(
        assertionsCounter,
        dumbFn,
        params,
      );
      expect(assertionsCounter.get()).toBeGreaterThan(0);
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });
  });
});
