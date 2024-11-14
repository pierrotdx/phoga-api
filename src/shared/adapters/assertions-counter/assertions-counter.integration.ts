import { randomInt } from "crypto";

import { IAssertionsCounter } from "../../core";
import { AssertionsCounter } from "./assertions-counter";

describe("AssertionsCounter", () => {
  let assertionsCounter: IAssertionsCounter;
  const expectAssertionsSpy = jest.spyOn(expect, "assertions");

  beforeEach(() => {
    assertionsCounter = new AssertionsCounter();
    expectAssertionsSpy.mockReset();
  });

  const nbTests = 6;
  for (let i = 0; i < nbTests; i++) {
    it("should call `expect.assertions` with the (randomly generated) expected assertions nb ", () => {
      const expectedAssertionsNb = randomInt(1000);
      assertionsCounter.increase(expectedAssertionsNb);

      assertionsCounter.checkAssertions();

      expect(expectAssertionsSpy).toHaveBeenCalledTimes(1);
      expect(expectAssertionsSpy).toHaveBeenLastCalledWith(
        expectedAssertionsNb,
      );
      expect.assertions(2);
    });
  }
});
