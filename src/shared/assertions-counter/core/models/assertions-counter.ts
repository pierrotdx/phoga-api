import { ICounter } from "@shared/counter";

export interface IAssertionsCounter extends ICounter {
  checkAssertions(): void;
}
