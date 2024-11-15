import { IAssertionsCounter } from "../../../core/";
import { Counter } from "../counter";

export class AssertionsCounter extends Counter implements IAssertionsCounter {
  checkAssertions(): void {
    const count = this.get();
    expect.assertions(count);
  }
}
