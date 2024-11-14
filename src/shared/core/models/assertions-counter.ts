import { ICounter } from "./counter";

export interface IAssertionsCounter extends ICounter {
  checkAssertions(): void;
}
