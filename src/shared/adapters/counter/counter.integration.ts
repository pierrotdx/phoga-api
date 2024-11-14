import { ICounter } from "../../core/models";
import { Counter } from "./counter";

describe("Counter", () => {
  let counter: ICounter;

  beforeEach(() => {
    counter = new Counter();
  });

  describe("get", () => {
    it("should return the current value of count", () => {
      expect(counter.get()).toBe(0);
      counter.increase();
      expect(counter.get()).toBe(1);
      expect.assertions(2);
    });
  });

  describe("increase", () => {
    it("should increment the count value by 1 by default", () => {
      const nbIncrements = 10;
      let currentCount = counter.get();
      while (currentCount < nbIncrements) {
        counter.increase();
        const newCount = counter.get();
        expect(newCount).toEqual(currentCount + 1);
        currentCount = newCount;
      }
      expect(counter.get()).toBe(nbIncrements);
      expect.assertions(1 + nbIncrements);
    });

    it("should increment the count value by the input value", () => {
      const currentCount = counter.get();
      const increaseValue = 5;
      counter.increase(increaseValue);
      const newCount = counter.get();
      expect(newCount).toEqual(currentCount + increaseValue);
      expect.assertions(1);
    });
  });
});
