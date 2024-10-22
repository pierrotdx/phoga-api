import { ICounter } from "./counter";

export interface ISharedTestUtils {
  checkAssertionsCount(assertionCounter: ICounter): void;
}
