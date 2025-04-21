import { Request } from "express";

export interface IParser<T> {
  parse(req: Request): T;
}

export interface IParserAsync<T> {
  parse(req: Request): Promise<T>;
}
