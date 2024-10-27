import { IAssertionsCounter, ISharedTestUtils } from "../models";

export class SharedTestUtils implements ISharedTestUtils {
  async expectRejection({
    asyncFn,
    fnParams,
    assertionsCounter,
  }: {
    asyncFn: Function;
    fnParams: unknown[];
    assertionsCounter: IAssertionsCounter;
  }): Promise<void> {
    try {
      await asyncFn(...fnParams);
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

export const sharedTestUtils = new SharedTestUtils();
