import { IAssertionsCounter } from "#shared/assertions-counter";

export interface ISharedTestUtils {
  expectFunctionToBeCalledWith(
    assertionsCounter: IAssertionsCounter,
    spy: jest.SpyInstance,
    ...params: unknown[]
  ): void;
}
