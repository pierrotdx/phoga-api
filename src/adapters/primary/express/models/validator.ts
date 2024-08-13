import { Request } from "express";
import { TSchema } from "./schema";

export interface IValidator<T> {
  parse: (schema: TSchema, req: Request) => T;
}
