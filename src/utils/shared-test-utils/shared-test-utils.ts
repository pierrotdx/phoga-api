import { ICounter, ISharedTestUtils } from "../models";

export class SharedTestUtils implements ISharedTestUtils {
  checkAssertionsCount(assertionCounter: ICounter): void {
    const nbAssertions = assertionCounter.get();
    expect.assertions(nbAssertions);
  }
}

export const sharedTestUtils = new SharedTestUtils();
