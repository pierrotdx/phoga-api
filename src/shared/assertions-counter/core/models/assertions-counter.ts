import { ICounter } from "@shared";

export interface IAssertionsCounter extends ICounter {
  checkAssertions(): void;
}
