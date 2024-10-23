import { ICounter, ISharedTestUtils } from "../models";

export class SharedTestUtils implements ISharedTestUtils {
  checkAssertionsCount(assertionCounter: ICounter): void {
    const nbAssertions = assertionCounter.get();
    expect.assertions(nbAssertions);
  }

  async expectRejection({
    asyncFn,
    fnParams,
    assertionsCounter,
  }: {
    asyncFn: Function;
    fnParams: unknown[];
    assertionsCounter: ICounter;
  }): Promise<void> {
    try {
      await asyncFn(...fnParams);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      assertionsCounter.increase();
    }
  }
}

export const sharedTestUtils = new SharedTestUtils();
