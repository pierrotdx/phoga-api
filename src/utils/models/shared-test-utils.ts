import { IAssertionsCounter } from "./assertions-counter";

export interface ISharedTestUtils {
  expectRejection({
    asyncFn,
    fnParams,
    assertionsCounter,
  }: {
    asyncFn: Function;
    fnParams: unknown[];
    assertionsCounter: IAssertionsCounter;
  }): Promise<void>;
  expectFunctionToBeCalledWith(
    spy: jest.SpyInstance,
    params: unknown[],
    assertionsCounter: IAssertionsCounter,
  ): void;
}
