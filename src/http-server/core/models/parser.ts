export interface IParser<T> {
  parse(data: any): T;
}
