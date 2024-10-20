import { Test } from "supertest";

import { ICounter } from "@utils";
import { AjvValidator } from "./ajv-validator";
import { TSchema } from "@http-server";

export class AjvTestUtils {
  public expectCorrectInvocation({
    spy,
    params,
    assertionCounter,
  }: {
    spy: jest.SpyInstance;
    params: unknown[];
    assertionCounter: ICounter;
  }): void {
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(...params);
    assertionCounter.increase(2);
  }
}
