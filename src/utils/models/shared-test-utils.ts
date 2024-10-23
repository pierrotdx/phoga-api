import { ICounter } from "./counter";

export interface ISharedTestUtils {
  checkAssertionsCount(assertionCounter: ICounter): void;
  expectRejection({
    asyncFn,
    fnParams,
    assertionsCounter,
  }: {
    asyncFn: Function;
    fnParams: unknown[];
    assertionsCounter: ICounter;
  }): Promise<void>;
}
