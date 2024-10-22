import { Test } from "supertest";

import { TSchema } from "@http-server";
import { ICounter } from "@utils";

import { AjvValidator } from "./ajv-validator";

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
