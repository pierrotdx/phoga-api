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
}

export const sharedTestUtils = new SharedTestUtils();
