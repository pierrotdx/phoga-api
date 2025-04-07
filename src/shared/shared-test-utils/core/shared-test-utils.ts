import { IAssertionsCounter } from "@shared/assertions-counter";

import { ISharedTestUtils } from "../core"; 

export class SharedTestUtils implements ISharedTestUtils {
  async expectRejection({
    fnExpectedToReject,
    fnParams,
    assertionsCounter,
  }: {
    fnExpectedToReject: Function;
    fnParams: unknown[];
    assertionsCounter: IAssertionsCounter;
  }): Promise<void> {
    try {
      await fnExpectedToReject(...fnParams);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      assertionsCounter.increase();
    }
  }

  expectFunctionToBeCalledWith(
    assertionsCounter: IAssertionsCounter,
    spy: jest.SpyInstance,
    ...params: unknown[]
  ): void {
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(...params);
    assertionsCounter.increase(2);
  }
}
