import { IAssertionsCounter, ISharedTestUtils } from "../../models";

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

  expectMatchingBuffers(
    bufferA: Buffer,
    bufferB: Buffer,
    assertionsCounter: IAssertionsCounter,
  ) {
    const haveSameContent = bufferA.compare(bufferB) === 0;
    expect(haveSameContent).toBe(true);
    assertionsCounter.increase();
  }
}

export const sharedTestUtils = new SharedTestUtils();
