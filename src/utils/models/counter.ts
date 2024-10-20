export interface ICounter {
  increase(value?: number): void;
  get(): number;
}
