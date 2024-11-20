import { ICounter } from "../models";

export class Counter implements ICounter {
  private count: number = 0;

  increase(value: number = 1) {
    this.count += value;
  }

  get() {
    return this.count;
  }
}
