export interface IParser<T> {
  parse(data: any): T;
}

export interface IParserAsync<T> {
  parse(data: any): Promise<T>;
}
