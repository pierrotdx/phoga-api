import { IAssertionsCounter } from "@assertions-counter";

export class AjvTestUtils {
  public expectCorrectInvocation({
    spy,
    params,
    assertionsCounter,
  }: {
    spy: jest.SpyInstance;
    params: unknown[];
    assertionsCounter: IAssertionsCounter;
  }): void {
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(...params);
    assertionsCounter.increase(2);
  }
}
