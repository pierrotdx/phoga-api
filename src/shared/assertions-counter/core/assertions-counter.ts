import { Counter } from "@shared/counter";

import { IAssertionsCounter } from "./models";

export class AssertionsCounter implements IAssertionsCounter {
  private readonly counter = new Counter();

  get(): number {
    return this.counter.get();
  }

  increase(value?: number): void {
    this.counter.increase(value);
  }

  checkAssertions(): void {
    const count = this.get();
    expect.assertions(count);
  }
}
