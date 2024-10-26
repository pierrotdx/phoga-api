import { Counter } from "../counter";
import { IAssertionsCounter } from "../models";

export class AssertionsCounter extends Counter implements IAssertionsCounter {
  checkAssertions(): void {
    const count = this.get();
    expect.assertions(count);
  }
}
